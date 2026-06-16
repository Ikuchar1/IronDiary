import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { BodyWeightService } from './body-weight.service';
import { BodyWeightLogDto, CreateBodyWeightLogDto } from '../models/body-weight.model';
import { environment } from '../../../environments/environment';

describe('BodyWeightService', () => {
  let service: BodyWeightService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/bodyweightlog`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), BodyWeightService]
    });
    service = TestBed.inject(BodyWeightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all bodyweight logs', () => {
    const mockLogs: BodyWeightLogDto[] = [
      { id: 1, weight: 180, date: '2026-03-01T00:00:00Z' }
    ];

    service.getAll().subscribe(logs => {
      expect(logs).toEqual(mockLogs);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });

  it('should GET a bodyweight log by id', () => {
    const mockLog: BodyWeightLogDto = { id: 1, weight: 180, date: '2026-03-01T00:00:00Z' };

    service.getById(1).subscribe(log => {
      expect(log).toEqual(mockLog);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLog);
  });

  it('should POST a new bodyweight log', () => {
    const dto: CreateBodyWeightLogDto = { weight: 181, date: '2026-03-02' };
    const mockResponse: BodyWeightLogDto = { id: 2, weight: 181, date: '2026-03-02T00:00:00Z' };

    service.create(dto).subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('should DELETE a bodyweight log by id', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
