import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { WorkoutLogService } from './workout-log.service';
import { CreateWorkoutLogDto, WorkoutLogDetailDto, WorkoutLogDto, WorkoutLogWriteResultDto } from '../models/workout-log.model';
import { environment } from '../../../environments/environment';

describe('WorkoutLogService', () => {
  let service: WorkoutLogService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/workoutlog`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), WorkoutLogService]
    });
    service = TestBed.inject(WorkoutLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all workout logs', () => {
    const mockLogs: WorkoutLogDto[] = [
      { id: 1, type: 'Push', description: 'Chest day', date: '2026-03-01T00:00:00Z' }
    ];

    service.getWorkoutLogs().subscribe(logs => {
      expect(logs).toEqual(mockLogs);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });

  it('should POST a new workout log and surface the override indicator', () => {
    const dto: CreateWorkoutLogDto = { type: 'Pull', description: 'Back day', date: '2026-03-02T00:00:00Z' };
    const mockResponse: WorkoutLogWriteResultDto = {
      workout: { id: 2, type: 'Pull', description: 'Back day', date: '2026-03-02T00:00:00Z' },
      overrodeRestDay: true
    };

    service.createWorkoutLog(dto).subscribe(result => {
      expect(result).toEqual(mockResponse);
      expect(result.overrodeRestDay).toBeTrue();
      expect(result.workout.id).toBe(2);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should PUT an updated workout log and surface the override indicator', () => {
    const dto: CreateWorkoutLogDto = { type: 'Pull', description: 'Rows', date: '2026-03-05T00:00:00Z' };
    const mockResponse: WorkoutLogWriteResultDto = {
      workout: { id: 7, type: 'Pull', description: 'Rows', date: '2026-03-05T00:00:00Z' },
      overrodeRestDay: true
    };

    service.updateWorkoutLog(7, dto).subscribe(result => {
      expect(result).toEqual(mockResponse);
      expect(result.overrodeRestDay).toBeTrue();
      expect(result.workout.type).toBe('Pull');
    });

    const req = httpMock.expectOne(`${apiUrl}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should GET a workout log by id', () => {
    const mockDetail: WorkoutLogDetailDto = {
      id: 1, type: 'Legs', description: 'Leg day', date: '2026-03-03T00:00:00Z', photos: []
    };

    service.getWorkoutLogById(1).subscribe(log => {
      expect(log).toEqual(mockDetail);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDetail);
  });

  it('should DELETE a workout log by id', () => {
    service.deleteWorkoutLog(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should GET workout logs by date range', () => {
    const mockLogs: WorkoutLogDto[] = [
      { id: 1, type: 'Push', date: '2026-03-01T00:00:00Z' }
    ];
    const startDate = '2026-03-01T00:00:00Z';
    const endDate = '2026-03-31T00:00:00Z';

    service.getWorkoutLogsByDateRange(startDate, endDate).subscribe(logs => {
      expect(logs).toEqual(mockLogs);
    });

    const req = httpMock.expectOne(r =>
      r.url === `${apiUrl}/range` &&
      r.params.get('startDate') === startDate &&
      r.params.get('endDate') === endDate
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });
});
