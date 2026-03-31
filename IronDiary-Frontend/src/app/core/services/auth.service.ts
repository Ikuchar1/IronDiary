import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string){
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(){
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

}
