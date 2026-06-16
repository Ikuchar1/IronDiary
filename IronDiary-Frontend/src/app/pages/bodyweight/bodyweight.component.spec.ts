import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { BodyweightComponent } from './bodyweight.component';
import { BodyWeightLogDto } from '../../core/models/body-weight.model';
import { toLocalDateString } from '../../core/utils/local-date.util';
import { environment } from '../../../environments/environment';

describe('BodyweightComponent', () => {
  let component: BodyweightComponent;
  let fixture: ComponentFixture<BodyweightComponent>;
  let httpMock: HttpTestingController;
  let dialog: { open: jasmine.Spy };
  let dialogResult: boolean;

  const apiUrl = `${environment.apiUrl}/bodyweightlog`;

  // An ISO date string N days before now (local noon, so no TZ day-crossing).
  function daysAgoIso(n: number): string {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  beforeEach(async () => {
    // Stub MatDialog at the framework boundary: open() returns a ref whose
    // afterClosed() emits the chosen result (confirmed = true / cancelled = false).
    dialogResult = false;
    dialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(dialogResult) }),
    };

    await TestBed.configureTestingModule({
      imports: [BodyweightComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BodyweightComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);
    expect(component).toBeTruthy();
  });

  it('feeds the deduped, oldest-first series to the chart on init', () => {
    const logs: BodyWeightLogDto[] = [
      { id: 1, weight: 180, date: '2026-03-01T08:00:00Z' },
      { id: 4, weight: 178, date: '2026-03-01T20:00:00Z' }, // same day -> wins
      { id: 2, weight: 182, date: '2026-03-03T00:00:00Z' },
    ];

    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush(logs);

    expect(component.lineChartData.labels).toEqual(['2026-03-01', '2026-03-03']);
    expect(component.lineChartData.datasets[0].data).toEqual([178, 182]);
    expect(component.hasData).toBeTrue();
  });

  it('flags the empty state when there are no logs', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);

    expect(component.hasData).toBeFalse();
    expect(component.lineChartData.datasets[0]?.data ?? []).toEqual([]);
  });

  it('defaults the range to all time', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);

    expect(component.range).toBe('all');
  });

  it('narrows the series fed to the chart when the range changes, without refetching', () => {
    const logs: BodyWeightLogDto[] = [
      { id: 1, weight: 180, date: daysAgoIso(5) },
      { id: 2, weight: 181, date: daysAgoIso(100) },
      { id: 3, weight: 182, date: daysAgoIso(400) },
    ];

    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush(logs);

    expect(component.lineChartData.datasets[0].data?.length).toBe(3); // all time

    component.setRange('month');
    expect(component.lineChartData.datasets[0].data?.length).toBe(1);

    component.setRange('year');
    expect(component.lineChartData.datasets[0].data?.length).toBe(2);

    // afterEach httpMock.verify() asserts no second GET was issued.
  });

  it('lists every weigh-in newest-first, keeping same-day duplicates', () => {
    const logs: BodyWeightLogDto[] = [
      { id: 1, weight: 180, date: '2026-03-01T08:00:00Z' },
      { id: 4, weight: 178, date: '2026-03-01T20:00:00Z' }, // same day, later
      { id: 2, weight: 182, date: '2026-03-03T00:00:00Z' },
    ];

    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush(logs);
    fixture.detectChanges();

    // List shows ALL logs (unlike the deduped chart) so a stray same-day weigh-in
    // stays visible and deletable; newest-first, same-day tie-broken by id desc.
    expect(component.entries.map(e => e.id)).toEqual([2, 4, 1]);

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.entry-row');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('182');
    expect(rows[1].textContent).toContain('178');
    expect(rows[2].textContent).toContain('180');
  });

  it('shows a list empty state when there are no weigh-ins', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.entry-row').length).toBe(0);
    expect(el.querySelector('.list-empty')?.textContent).toContain('No weigh-ins');
  });

  it('adds a weigh-in: POSTs the chosen day then refreshes the chart and list', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);
    fixture.detectChanges();

    component.newWeight = 175;
    component.newDate = new Date(2026, 2, 9); // Mar 9 (local parts -> bare YYYY-MM-DD)
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.add-btn')!.click();

    const post = httpMock.expectOne(apiUrl);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ weight: 175, date: '2026-03-09' });
    post.flush({ id: 9, weight: 175, date: '2026-03-09T00:00:00Z' });

    // A successful add re-loads so chart + list reflect the new entry.
    httpMock.expectOne(apiUrl).flush([{ id: 9, weight: 175, date: '2026-03-09T00:00:00Z' }]);
    fixture.detectChanges();

    expect(component.entries.map(e => e.id)).toEqual([9]);
    expect(component.newWeight).toBeNull(); // form reset
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.entry-row').length).toBe(1);
  });

  it('does not POST a weigh-in when the weight is empty or <= 0', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);
    fixture.detectChanges();

    component.newWeight = null;
    component.addEntry();
    expect(component.canAdd).toBeFalse();

    component.newWeight = 0;
    component.addEntry();

    component.newWeight = -5;
    component.addEntry();

    httpMock.expectNone(apiUrl); // afterEach verify() also asserts no POST fired
  });

  it('deletes a weigh-in when confirmed, then refreshes the chart and list', () => {
    dialogResult = true; // confirm dialog returns confirmed
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([
      { id: 1, weight: 180, date: '2026-03-01T00:00:00Z' },
      { id: 2, weight: 182, date: '2026-03-03T00:00:00Z' },
    ]);
    fixture.detectChanges();

    // Delete the newest row (id 2, rendered first) via its menu action.
    component.deleteEntry(2);

    expect(dialog.open).toHaveBeenCalled();
    const del = httpMock.expectOne(`${apiUrl}/2`);
    expect(del.request.method).toBe('DELETE');
    del.flush({});

    // A successful delete re-loads so chart + list drop the removed entry.
    httpMock.expectOne(apiUrl).flush([{ id: 1, weight: 180, date: '2026-03-01T00:00:00Z' }]);
    fixture.detectChanges();

    expect(component.entries.map(e => e.id)).toEqual([1]);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.entry-row').length).toBe(1);
  });

  it('does not delete when the confirm dialog is cancelled', () => {
    dialogResult = false; // cancelled
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([{ id: 1, weight: 180, date: '2026-03-01T00:00:00Z' }]);
    fixture.detectChanges();

    component.deleteEntry(1);

    expect(dialog.open).toHaveBeenCalled();
    httpMock.expectNone(`${apiUrl}/1`); // no DELETE, no refetch
  });

  it('enters inline edit for a row, prefilled with its values', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([{ id: 5, weight: 183, date: '2026-03-03T00:00:00Z' }]);
    fixture.detectChanges();

    component.startEdit(component.entries[0]);
    fixture.detectChanges();

    expect(component.editingId).toBe(5);
    expect(component.editWeight).toBe(183);
    expect(toLocalDateString(component.editDate)).toBe('2026-03-03');
    // The row swaps its static display for inline inputs.
    expect((fixture.nativeElement as HTMLElement).querySelector('.entry-edit')).toBeTruthy();
  });

  it('saves an inline edit via PUT, then refreshes the chart and list', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([{ id: 5, weight: 183, date: '2026-03-03T00:00:00Z' }]);
    fixture.detectChanges();

    component.startEdit(component.entries[0]);
    component.editWeight = 178.5;
    component.saveEdit();

    const put = httpMock.expectOne(`${apiUrl}/5`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ weight: 178.5, date: '2026-03-03' });
    put.flush({ id: 5, weight: 178.5, date: '2026-03-03T00:00:00Z' });

    // A successful edit re-loads so chart + list reflect the new value.
    httpMock.expectOne(apiUrl).flush([{ id: 5, weight: 178.5, date: '2026-03-03T00:00:00Z' }]);
    fixture.detectChanges();

    expect(component.editingId).toBeNull();
    expect(component.entries[0].weight).toBe(178.5);
  });

  it('cancels an inline edit without a PUT', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([{ id: 5, weight: 183, date: '2026-03-03T00:00:00Z' }]);
    fixture.detectChanges();

    component.startEdit(component.entries[0]);
    component.cancelEdit();

    expect(component.editingId).toBeNull();
    httpMock.expectNone(`${apiUrl}/5`); // afterEach verify() also asserts no PUT
  });

  it('does not PUT an inline edit when the weight is empty or <= 0', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([{ id: 5, weight: 183, date: '2026-03-03T00:00:00Z' }]);
    fixture.detectChanges();

    component.startEdit(component.entries[0]);

    component.editWeight = 0;
    component.saveEdit();

    component.editWeight = null;
    component.saveEdit();

    httpMock.expectNone(`${apiUrl}/5`);
  });
});
