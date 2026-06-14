import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { EntryDetailComponent } from './entry-detail.component';
import { EntryFormComponent } from '../entry-form/entry-form.component';
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
  // The embedded edit form injects MatSnackBar (override path); stub it at the boundary.
  const snackBar = { open: jasmine.createSpy('open') };

  TestBed.configureTestingModule({
    imports: [EntryDetailComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: MatDialog, useValue: dialog },
      { provide: MatSnackBar, useValue: snackBar },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: { kind }, paramMap: convertToParamMap({ id }) } },
      },
    ],
  });

  const fixture = TestBed.createComponent(EntryDetailComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock, dialog, snackBar };
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

  it('renders the detail date in UTC so the stored calendar day never shifts by timezone', () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges();
    // Stored at midnight UTC (ADR-0003); must show the logged day, not local-1.
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ id: 3, type: 'Push', date: '2026-06-14T00:00:00Z', photos: [] });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Jun 14');
    expect(text).not.toContain('Jun 13');
  });

  it('routes to the Timeline when the Back button is clicked', () => {
    const { fixture, httpMock } = setup('workout', '3');
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();
    httpMock.expectOne(`${workoutUrl}/3`).flush({ id: 3, type: 'Push', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.back-btn')!.click();

    expect(navSpy).toHaveBeenCalledWith(['/log']);
  });

  it('reveals the prefilled edit form with the kind toggle hidden when Edit is clicked', async () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges();

    const workout: WorkoutLogDetailDto = {
      id: 3,
      type: 'Push',
      description: 'flat bench + dips',
      date: '2026-06-11',
      photos: [],
    };
    httpMock.expectOne(`${workoutUrl}/3`).flush(workout);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    fixture.detectChanges();
    await fixture.whenStable(); // let ngModel flush prefilled values into the inputs
    fixture.detectChanges();

    // The shared form appears in edit mode...
    expect(el.querySelector('app-entry-form')).toBeTruthy();
    // ...with the Workout/Rest toggle hidden (kind is fixed)...
    expect(el.querySelector('.kind-toggle')).toBeNull();
    // ...and the Type field pre-filled from the entry.
    expect((el.querySelector('input[name="type"]') as HTMLInputElement).value).toBe('Push');
  });

  it('persists an edit via PUT and returns to the read-only view with updated values', async () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges();
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ id: 3, type: 'Push', description: 'old', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Edit the Type field through the DOM (ngModel updates the form's model).
    const typeInput = el.querySelector('input[name="type"]') as HTMLInputElement;
    typeInput.value = 'Pull';
    typeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.save-btn')!.click();

    const put = httpMock.expectOne(`${workoutUrl}/3`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body.type).toBe('Pull');
    put.flush({ workout: { id: 3, type: 'Pull', date: '2026-06-11' }, overrodeRestDay: false });

    // The detail page re-fetches the entry and flips back to read-only.
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ id: 3, type: 'Pull', description: 'old', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    expect(el.querySelector('app-entry-form')).toBeNull();
    expect(el.textContent).toContain('Pull');
  });

  it('discards an edit and returns to read-only when Cancel is clicked, with no PUT', async () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges();
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ id: 3, type: 'Push', description: 'flat bench', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Edit a field, then bail out.
    const typeInput = el.querySelector('input[name="type"]') as HTMLInputElement;
    typeInput.value = 'Pull';
    typeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.cancel-btn')!.click();
    fixture.detectChanges();

    // Back to read-only showing the ORIGINAL value; afterEach's verify() asserts no PUT.
    expect(el.querySelector('app-entry-form')).toBeNull();
    expect(el.textContent).toContain('Push');
  });

  it('shows the override snackbar when an edited Workout lands on a rest-day date', async () => {
    const { fixture, httpMock, snackBar } = setup('workout', '3');
    fixture.detectChanges();
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ id: 3, type: 'Push', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.save-btn')!.click();

    // PUT reports it overrode a rest day on the (moved) date.
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ workout: { id: 3, type: 'Push', date: '2026-06-11' }, overrodeRestDay: true });
    httpMock.expectOne(`${workoutUrl}/3`).flush({ id: 3, type: 'Push', date: '2026-06-11', photos: [] });
    fixture.detectChanges();

    expect(snackBar.open).toHaveBeenCalled();
    expect(snackBar.open.calls.mostRecent().args[0] as string).toContain('Replaced your rest day');
  });

  it('shows a 409 inline error and stays in edit when an edited Rest Day lands on a trained date', async () => {
    const { fixture, httpMock } = setup('rest', '8');
    fixture.detectChanges();
    httpMock.expectOne(`${restUrl}/8`).flush({ id: 8, note: 'travel day', date: '2026-06-12' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.save-btn')!.click();

    httpMock
      .expectOne(`${restUrl}/8`)
      .flush('You already logged a workout on this day.', { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    // Stays in edit (form still present, no re-fetch) with the server's message inline.
    expect(el.querySelector('app-entry-form')).toBeTruthy();
    expect(el.querySelector('.form-error')?.textContent).toContain('already logged a workout');
  });

  it('prefills the edit date from a full ISO timestamp returned by the API', async () => {
    const { fixture, httpMock } = setup('workout', '3');
    fixture.detectChanges();
    // The API serializes Date as a full ISO8601 timestamp, not a bare YYYY-MM-DD.
    httpMock
      .expectOne(`${workoutUrl}/3`)
      .flush({ id: 3, type: 'Push', date: '2026-06-11T00:00:00Z', photos: [] });
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.edit-btn')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.directive(EntryFormComponent))
      .componentInstance as EntryFormComponent;
    // Must be a valid Date for the logged calendar day (not Invalid Date / blank).
    expect(form.date.getFullYear()).toBe(2026);
    expect(form.date.getMonth()).toBe(5); // June, 0-based
    expect(form.date.getDate()).toBe(11);
  });
});
