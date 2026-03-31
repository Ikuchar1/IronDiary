import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutLogService } from '../../core/services/workout-log.service';
import { BodyWeightService } from '../../core/services/body-weight.service';
import { WorkoutLogDto } from '../../core/models/workout-log.model';
import { BodyWeightLogDto } from '../../core/models/body-weight.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatChipsModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true
})
export class DashboardComponent implements OnInit {

  recentLogs: WorkoutLogDto[] = [];
  latestWeight: BodyWeightLogDto | null = null;
  streak = 0;
  isLoading = true;

  constructor(private workoutLogService: WorkoutLogService,
              private bodyWeightService: BodyWeightService,
              private router: Router
            ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  //function that will go and get all the workout logs and body weight logs for the user
  loadDashboardData() {
    this.workoutLogService.getWorkoutLogs().subscribe({
      next: (logs) => {
        this.recentLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        this.streak = this.calculateStreak(logs);
        this.isLoading = false;

      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.bodyWeightService.getAll().subscribe({
      next: (entries) => {
        this.latestWeight = entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
      }
    });

  }

  calculateStreak(logs: WorkoutLogDto[]): number {
    if (logs.length === 0) return 0;

    const dates = [...new Set(
      logs.map(l => new Date(l.date).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const diffDays = Math.round((current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        current = date;
      } else {
        break;
      }
    }

    return streak;
  }

  get mostRecentLog(): WorkoutLogDto | null {
    return this.recentLogs[0] ?? null;
  }

  goToLog() {
    this.router.navigate(['/log']);
  }

}
