import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RestDayDto, CreateRestDayDto } from '../models/rest-day.model';

@Injectable({ providedIn: 'root' })
export class RestDayService {
  private apiUrl = `${environment.apiUrl}/restday`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<RestDayDto[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<RestDayDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateRestDayDto) {
    return this.http.post<RestDayDto>(this.apiUrl, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
