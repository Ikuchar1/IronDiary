import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { RestDayService } from './rest-day.service';
import { CreateRestDayDto, RestDayDto } from '../models/rest-day.model';
import { environment } from '../../../environments/environment';

describe('RestDayService', () => {
  let service: RestDayService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/restday`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), RestDayService]
    });
    service = TestBed.inject(RestDayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should PUT an updated rest day', () => {
    const dto: CreateRestDayDto = { note: 'moved my rest day', date: '2026-03-06T00:00:00Z' };
    const mockResponse: RestDayDto = { id: 3, note: 'moved my rest day', date: '2026-03-06T00:00:00Z' };

    service.update(3, dto).subscribe(restDay => {
      expect(restDay).toEqual(mockResponse);
      expect(restDay.note).toBe('moved my rest day');
    });

    const req = httpMock.expectOne(`${apiUrl}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });
});
