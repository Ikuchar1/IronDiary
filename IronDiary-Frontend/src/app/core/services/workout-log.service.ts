import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateWorkoutLogDto, WorkoutLogDetailDto, WorkoutLogDto } from '../models/workout-log.model';

@Injectable({ providedIn: 'root' })
export class WorkoutLogService {
  private apiUrl = 'http://localhost:5092/api/workoutlog';

  constructor(private http: HttpClient) {}

  getWorkoutLogs() {
    return this.http.get<WorkoutLogDto[]>(this.apiUrl);
  }

  createWorkoutLog(dto: CreateWorkoutLogDto) {
    return this.http.post<WorkoutLogDto>(this.apiUrl, dto);
  }

  getWorkoutLogById(id: number) {
    return this.http.get<WorkoutLogDetailDto>(`${this.apiUrl}/${id}`);
  }

  deleteWorkoutLog(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getWorkoutLogsByDateRange(startDate: string, endDate: string) {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<WorkoutLogDto[]>(`${this.apiUrl}/range`, { params });
  }
}
