import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { EntryDetailComponent } from './entry-detail.component';
import { environment } from '../../../../environments/environment';
import { WorkoutLogDetailDto } from '../../../core/models/workout-log.model';
import { RestDayDto } from '../../../core/models/rest-day.model';

const workoutUrl = `${environment.apiUrl}/workoutlog`;
const restUrl = `${environment.apiUrl}/restday`;

// Build the component with a stubbed route supplying kind + id, then resolve
// the matching GET so the detail renders.
function setup(kind: 'workout' | 'rest', id: string, dialogResult = false) {
  // Stub MatDialog at the framework boundary: open() returns a ref whose
  // afterClosed() emits the chosen result (confirmed = true / cancelled = false).
  const dialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(dialogResult) }),
  };

  TestBed.configureTestingModule({
    imports: [EntryDetailComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: MatDialog, useValue: dialog },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: { kind }, paramMap: convertToParamMap({ id }) } },
      },
    ],
  });

  const fixture = TestBed.createComponent(EntryDetailComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock, dialog };
}

describe('EntryDetailComponent', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('renders a workout detail with Type, Description, and date', () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges(); // ngOnInit fires the GET

    const workout: WorkoutLogDetailDto = {
      id: 3,
      type: 'Push',
      description: 'flat bench + dips',
      date: '2026-06-11',
      photos: [],
    };
    httpMock.expectOne(`${workoutUrl}/3`).flush(workout);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Push');
    expect(text).toContain('flat bench + dips');
    expect(text).toContain('Jun'); // date rendered via date pipe
  });

  it('renders a Photos placeholder and never the photos array', () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges();

    const workout: WorkoutLogDetailDto = {
      id: 3,
      type: 'Push',
      date: '2026-06-11',
      photos: [{ id: 1, url: 'https://example.com/broken.jpg', workoutLogId: 3 }],
    };
    httpMock.expectOne(`${workoutUrl}/3`).flush(workout);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.photos-placeholder')).toBeTruthy();
    // The dummy/broken seed URL must never be rendered (no <img>, not in markup).
    expect(el.querySelector('img')).toBeNull();
    expect(el.innerHTML).not.toContain('broken.jpg');
  });

  it('renders a rest day detail with Note and date, and no photo section', () => {
    const { fixture, httpMock } = setup('rest', '8');
    fixture.detectChanges();

    const rest: RestDayDto = { id: 8, note: 'travel day', date: '2026-06-12' };
    httpMock.expectOne(`${restUrl}/8`).flush(rest);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent ?? '';
    expect(text).toContain('travel day');
    expect(text).toContain('Jun');
    expect(el.querySelector('.photos-placeholder')).toBeNull();
  });

  it('deletes and routes to /log when the confirm dialog is confirmed', () => {
    const { fixture, httpMock, dialog } = setup('workout', '3', true);
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();
    httpMock.expectOne(`${workoutUrl}/3`).flush({ id: 3, type: 'Push', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    const deleteBtn = (fixture.nativeElement as HTMLElement).querySelector(
      '.delete-btn'
    ) as HTMLButtonElement;
    deleteBtn.click();

    expect(dialog.open).toHaveBeenCalled();
    const del = httpMock.expectOne(`${workoutUrl}/3`);
    expect(del.request.method).toBe('DELETE');
    del.flush({});

    expect(navSpy).toHaveBeenCalledWith(['/log']);
  });

  it('does nothing when the confirm dialog is cancelled', () => {
    const { fixture, httpMock } = setup('workout', '3', false);
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();
    httpMock.expectOne(`${workoutUrl}/3`).flush({ id: 3, type: 'Push', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.delete-btn')!.click();

    httpMock.expectNone(`${workoutUrl}/3`); // no DELETE issued
    expect(navSpy).not.toHaveBeenCalled();
  });
});
