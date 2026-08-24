import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { WorkoutPhotoService } from './workout-photo.service';
import { environment } from '../../../environments/environment';

describe('WorkoutPhotoService', () => {
  let service: WorkoutPhotoService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/workoutphoto`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), WorkoutPhotoService]
    });
    service = TestBed.inject(WorkoutPhotoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should DELETE a workout photo by id', () => {
    service.delete(7).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
