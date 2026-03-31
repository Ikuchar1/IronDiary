import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BodyWeightLogDto, CreateBodyWeightLogDto } from '../models/body-weight.model';

@Injectable({ providedIn: 'root' })
export class BodyWeightService {
  private apiUrl = `${environment.apiUrl}/bodyweightlog`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<BodyWeightLogDto[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<BodyWeightLogDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateBodyWeightLogDto) {
    return this.http.post<BodyWeightLogDto>(this.apiUrl, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
