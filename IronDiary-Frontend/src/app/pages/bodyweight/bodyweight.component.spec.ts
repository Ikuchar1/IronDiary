import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { BodyweightComponent } from './bodyweight.component';
import { BodyWeightLogDto } from '../../core/models/body-weight.model';
import { environment } from '../../../environments/environment';

describe('BodyweightComponent', () => {
  let component: BodyweightComponent;
  let fixture: ComponentFixture<BodyweightComponent>;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/bodyweightlog`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyweightComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
});
