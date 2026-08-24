import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkoutPhotoService {
  private apiUrl = `${environment.apiUrl}/workoutphoto`;

  constructor(private http: HttpClient) {}

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
