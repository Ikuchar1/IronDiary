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
const bodyWeightUrl = `${environment.apiUrl}/bodyweightlog`;

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

  it('logs a bodyweight on the entry date after a workout saves, when weight is filled', () => {
    const { fixture, httpMock } = setup();
    spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();

    fixture.componentInstance.type = 'Push';
    fixture.componentInstance.weight = 180;
    fixture.detectChanges();
    saveBtn(fixture).click();

    // Entry is written first; the date it used drives the weigh-in.
    const entry = httpMock.expectOne(workoutUrl);
    const date = entry.request.body.date;
    entry.flush({ workout: { id: 7, type: 'Push', date }, overrodeRestDay: false });

    // A second, independent POST writes the weigh-in on the same date (ADR-0004).
    const weigh = httpMock.expectOne(bodyWeightUrl);
    expect(weigh.request.method).toBe('POST');
    expect(weigh.request.body).toEqual({ weight: 180, date });
    weigh.flush({ id: 3, weight: 180, date });
  });

  it('does not log a bodyweight when the weight field is left empty', () => {
    const { fixture, httpMock } = setup();
    spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();

    fixture.componentInstance.type = 'Push'; // weight left null
    fixture.detectChanges();
    saveBtn(fixture).click();

    httpMock.expectOne(workoutUrl).flush({
      workout: { id: 7, type: 'Push', date: toLocalDateString(new Date()) },
      overrodeRestDay: false,
    });

    // afterEach's httpMock.verify() asserts no second POST to bodyweightlog fired.
    httpMock.expectNone(bodyWeightUrl);
  });

  it('does not log a bodyweight when the weight is <= 0', () => {
    const { fixture, httpMock } = setup();
    spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();

    fixture.componentInstance.type = 'Push';
    fixture.componentInstance.weight = 0;
    fixture.detectChanges();
    saveBtn(fixture).click();

    httpMock.expectOne(workoutUrl).flush({
      workout: { id: 7, type: 'Push', date: toLocalDateString(new Date()) },
      overrodeRestDay: false,
    });

    httpMock.expectNone(bodyWeightUrl);
  });

  it('keeps the entry and warns when the weigh-in POST fails', () => {
    const { fixture, httpMock, snackBar } = setup();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();

    fixture.componentInstance.type = 'Push';
    fixture.componentInstance.weight = 180;
    fixture.detectChanges();
    saveBtn(fixture).click();

    httpMock.expectOne(workoutUrl).flush({
      workout: { id: 7, type: 'Push', date: toLocalDateString(new Date()) },
      overrodeRestDay: false,
    });

    // The weigh-in write fails -- but the entry is already saved (no rollback).
    httpMock
      .expectOne(bodyWeightUrl)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(navSpy).toHaveBeenCalledWith(['/log']); // entry kept, user still leaves
    expect(snackBar.open).toHaveBeenCalled();
    expect(snackBar.open.calls.mostRecent().args[0] as string).toContain('weigh-in');
  });

  it('shows the optional weight field on the create form for both Workout and Rest', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Workout (default): the weigh-in field is offered.
    expect(el.querySelector('input[name="weight"]')).not.toBeNull();

    (el.querySelector('.toggle-rest') as HTMLButtonElement).click();
    fixture.detectChanges();

    // Rest Day: still offered (weight is orthogonal to Workout/Rest, ADR-0004).
    expect(el.querySelector('input[name="weight"]')).not.toBeNull();
  });

  it('hides the weight field on the inline-edit path', () => {
    const { fixture } = setup();
    fixture.componentInstance.mode = 'edit';
    fixture.detectChanges();

    // Editing an existing entry: weight lives on /bodyweight, not here (ADR-0004).
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input[name="weight"]')
    ).toBeNull();
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
