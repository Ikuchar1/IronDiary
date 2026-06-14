import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { WorkoutLogService } from '../../core/services/workout-log.service';
import { BodyWeightService } from '../../core/services/body-weight.service';
import { RestDayService } from '../../core/services/rest-day.service';
import { WorkoutLogDto } from '../../core/models/workout-log.model';
import { BodyWeightLogDto } from '../../core/models/body-weight.model';
import { calculateStreak } from '../../core/utils/streak.util';
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
  streakDays = 0;
  workoutSessions = 0;
  isLoading = true;

  constructor(private workoutLogService: WorkoutLogService,
              private bodyWeightService: BodyWeightService,
              private restDayService: RestDayService,
              private router: Router
            ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  //function that will go and get all the workout logs, rest days and body weight logs for the user
  loadDashboardData() {
    // Streak counts workout days AND rest days, so fetch both before computing it.
    forkJoin({
      logs: this.workoutLogService.getWorkoutLogs(),
      restDays: this.restDayService.getAll(),
    }).subscribe({
      next: ({ logs, restDays }) => {
        this.recentLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        const { streakDays, workoutSessions } = calculateStreak(
          logs.map(l => l.date),
          restDays.map(r => r.date),
        );
        this.streakDays = streakDays;
        this.workoutSessions = workoutSessions;
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

  get mostRecentLog(): WorkoutLogDto | null {
    return this.recentLogs[0] ?? null;
  }

  goToNewEntry() {
    this.router.navigate(['/log/new']);
  }

}
