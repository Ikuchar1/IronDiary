import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent implements OnInit {

  token = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.token = this.authService.getToken() || 'No token found';
  }

  logout() {
    this.authService.logout();
  }

}
