import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkoutLogService } from '../../core/services/workout-log.service';
import { RestDayService } from '../../core/services/rest-day.service';
import { JournalEntry } from '../../core/models/journal-entry.model';
import { mergeJournalEntries } from '../../core/utils/journal-entry.util';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss',
})
export class LogComponent implements OnInit {
  entries: JournalEntry[] = [];
  isLoading = true;
  hasError = false;

  constructor(
    private workoutLogService: WorkoutLogService,
    private restDayService: RestDayService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      workouts: this.workoutLogService.getWorkoutLogs(),
      restDays: this.restDayService.getAll(),
    }).subscribe({
      next: ({ workouts, restDays }) => {
        this.entries = mergeJournalEntries(workouts, restDays);
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  // The kind discriminant decides which detail route a row opens.
  openEntry(entry: JournalEntry) {
    this.router.navigate(['/log', entry.kind, entry.id]);
  }

  goToNew() {
    this.router.navigate(['/log/new']);
  }
}
