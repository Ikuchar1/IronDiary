import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { LogComponent } from './log.component';
import { environment } from '../../../environments/environment';
import { WorkoutLogDto } from '../../core/models/workout-log.model';
import { RestDayDto } from '../../core/models/rest-day.model';

const workoutUrl = `${environment.apiUrl}/workoutlog`;
const restUrl = `${environment.apiUrl}/restday`;

describe('LogComponent', () => {
  let fixture: ComponentFixture<LogComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LogComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Resolve both forkJoin requests with the given payloads, then render.
  function flush(workouts: WorkoutLogDto[], restDays: RestDayDto[]) {
    fixture.detectChanges(); // triggers ngOnInit → fires both requests
    httpMock.expectOne(workoutUrl).flush(workouts);
    httpMock.expectOne(restUrl).flush(restDays);
    fixture.detectChanges();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('renders a row per entry from both endpoints with kind badges', () => {
    flush(
      [{ id: 1, type: 'Push', description: 'bench day', date: '2026-06-11' }],
      [{ id: 1, note: 'sore knees', date: '2026-06-10' }]
    );

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.entry-row');
    expect(rows.length).toBe(2);

    // Workout badge shows the Type; Rest badge shows "Rest".
    const badges = (fixture.nativeElement as HTMLElement).querySelectorAll('.entry-badge');
    expect(badges[0].textContent).toContain('Push');
    expect(badges[0].classList).toContain('badge-workout');
    expect(badges[1].textContent).toContain('Rest');
    expect(badges[1].classList).toContain('badge-rest');

    // Secondary line shows description / note.
    expect(text()).toContain('bench day');
    expect(text()).toContain('sore knees');
  });

  it('shows a spinner while loading, before data resolves', () => {
    fixture.detectChanges(); // ngOnInit fires the requests; nothing flushed yet

    const spinner = (fixture.nativeElement as HTMLElement).querySelector('mat-progress-spinner');
    expect(spinner).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.entry-row').length).toBe(0);

    // Resolve so httpMock.verify() in afterEach is satisfied.
    httpMock.expectOne(workoutUrl).flush([]);
    httpMock.expectOne(restUrl).flush([]);
  });

  it('shows the empty state with a new-entry button when there are no entries', () => {
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    flush([], []);

    expect(text()).toContain('No entries yet. Log your first workout or rest day.');

    const newButton = (fixture.nativeElement as HTMLElement).querySelector(
      '.empty-state button'
    ) as HTMLButtonElement;
    expect(newButton).toBeTruthy();

    newButton.click();
    expect(navSpy).toHaveBeenCalledWith(['/log/new']);
  });

  it('shows the error state and Retry re-issues both requests', () => {
    fixture.detectChanges();
    // forkJoin errors on the first failure and cancels the sibling request;
    // consume the cancelled one so it doesn't collide with the Retry below.
    httpMock.expectOne(workoutUrl).flush(null, { status: 500, statusText: 'Server Error' });
    expect(httpMock.expectOne(restUrl).cancelled).toBeTrue();
    fixture.detectChanges();

    expect(text()).toContain('Unable to load logs.');
    // The empty state must not also appear on error.
    expect((fixture.nativeElement as HTMLElement).querySelector('.empty-state')).toBeNull();

    const retry = (fixture.nativeElement as HTMLElement).querySelector(
      '.error-state button'
    ) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();

    // Retry re-runs the fetch; resolving it now renders rows.
    httpMock.expectOne(workoutUrl).flush([{ id: 1, type: 'Push', date: '2026-06-11' }]);
    httpMock.expectOne(restUrl).flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.entry-row').length).toBe(1);
  });

  it('routes by kind when a row is tapped', () => {
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    flush(
      [{ id: 7, type: 'Push', date: '2026-06-11' }],
      [{ id: 9, date: '2026-06-10' }]
    );

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      '.entry-row'
    );
    rows[0].click(); // workout, newest
    expect(navSpy).toHaveBeenCalledWith(['/log', 'workout', 7]);

    rows[1].click(); // rest
    expect(navSpy).toHaveBeenCalledWith(['/log', 'rest', 9]);
  });
});
