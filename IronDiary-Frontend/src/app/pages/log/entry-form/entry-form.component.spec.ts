import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EntryFormComponent } from './entry-form.component';
import { environment } from '../../../../environments/environment';
import { toLocalDateString } from '../../../core/utils/local-date.util';

const workoutUrl = `${environment.apiUrl}/workoutlog`;
const restUrl = `${environment.apiUrl}/restday`;

function setup() {
  const snackBar = { open: jasmine.createSpy('open') };

  TestBed.configureTestingModule({
    imports: [EntryFormComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: MatSnackBar, useValue: snackBar },
    ],
  });

  const fixture = TestBed.createComponent(EntryFormComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, httpMock, snackBar };
}

const saveBtn = (fixture: ComponentFixture<EntryFormComponent>) =>
  (fixture.nativeElement as HTMLElement).querySelector('.save-btn') as HTMLButtonElement;

describe('EntryFormComponent', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('disables Save for a Workout until a Type is entered', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    // Defaults to Workout with an empty Type → Save disabled.
    expect(saveBtn(fixture).disabled).toBe(true);

    fixture.componentInstance.type = 'Push';
    fixture.detectChanges();

    expect(saveBtn(fixture).disabled).toBe(false);
  });

  it('swaps to a Note field when toggled to Rest, and allows saving empty', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    (el.querySelector('.toggle-rest') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.querySelector('input[name="type"]')).toBeNull();
    expect(el.querySelector('input[name="note"]')).toBeTruthy();
    // A Rest Day saves with empty fields.
    expect(saveBtn(fixture).disabled).toBe(false);
  });

  it('posts the workout with a local date and, on override, shows a snackbar then routes to /log', () => {
    const { fixture, httpMock, snackBar } = setup();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();

    fixture.componentInstance.type = 'Push';
    fixture.detectChanges();
    saveBtn(fixture).click();

    const req = httpMock.expectOne(workoutUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.type).toBe('Push');
    // Date is built from local calendar parts (ADR-0003), not toISOString().
    expect(req.request.body.date).toBe(toLocalDateString(new Date()));

    req.flush({
      workout: { id: 7, type: 'Push', date: req.request.body.date },
      overrodeRestDay: true,
    });

    expect(snackBar.open).toHaveBeenCalled();
    expect((snackBar.open.calls.mostRecent().args[0] as string)).toContain('Replaced your rest day');
    expect(navSpy).toHaveBeenCalledWith(['/log']);
  });

  it('shows an inline error and stays on the form when a Rest Day save returns 409', () => {
    const { fixture, httpMock } = setup();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    (el.querySelector('.toggle-rest') as HTMLButtonElement).click();
    fixture.detectChanges();
    saveBtn(fixture).click();

    httpMock
      .expectOne(restUrl)
      .flush('You already logged a workout on this day.', { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(navSpy).not.toHaveBeenCalled();
    expect(el.querySelector('.form-error')?.textContent).toContain('already logged a workout');
  });

  it('discards and routes to /log when Cancel is clicked, with no API call', () => {
    const { fixture } = setup();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();

    fixture.componentInstance.type = 'Push'; // typed but unsaved
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.cancel-btn')!
      .click();

    expect(navSpy).toHaveBeenCalledWith(['/log']);
    // afterEach's httpMock.verify() asserts nothing was posted.
  });

  it('caps the date at today for a Workout and leaves it unrestricted for a Rest Day', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Workout (default): can't pick a future date.
    expect(toLocalDateString(fixture.componentInstance.maxDate!)).toBe(toLocalDateString(new Date()));

    (el.querySelector('.toggle-rest') as HTMLButtonElement).click();
    fixture.detectChanges();

    // Rest Day: any date allowed (e.g. planning a rest day ahead).
    expect(fixture.componentInstance.maxDate).toBeNull();
  });
});
