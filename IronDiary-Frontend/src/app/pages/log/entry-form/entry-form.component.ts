import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkoutLogService } from '../../../core/services/workout-log.service';
import { RestDayService } from '../../../core/services/rest-day.service';
import { toLocalDateString } from '../../../core/utils/local-date.util';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.scss',
})
export class EntryFormComponent {
  /** 'create' POSTs and navigates; 'edit' PUTs the existing entry and emits. */
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() entryId?: number;
  @Input() kind: 'workout' | 'rest' = 'workout';
  @Input() type = '';
  @Input() description = '';
  @Input() note = '';
  @Input() date = new Date();
  errorMessage = '';
  maxWorkoutDate = new Date();

  /** Edit mode reports success/cancel to the host instead of navigating. */
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private workoutLogService: WorkoutLogService,
    private restDayService: RestDayService
  ) {}

  get canSave(): boolean {
    return this.kind === 'rest' || this.type.trim().length > 0;
  }

  /** Workout can't be logged in the future; a Rest Day may be planned ahead. */
  get maxDate(): Date | null {
    return this.kind === 'workout' ? this.maxWorkoutDate : null;
  }

  setKind(kind: 'workout' | 'rest') {
    this.kind = kind;
  }

  cancel() {
    // In edit mode the host owns the view; just report the cancel. Otherwise
    // discard whatever was typed and return to the Timeline (leaving the route
    // destroys the component, so there's no in-progress state to clear).
    if (this.mode === 'edit') {
      this.cancelled.emit();
      return;
    }
    this.router.navigate(['/log']);
  }

  /** Success leaves the form: create navigates to /log; edit emits `saved`. */
  private onSaved() {
    if (this.mode === 'edit') {
      this.saved.emit();
    } else {
      this.router.navigate(['/log']);
    }
  }

  save() {
    this.errorMessage = '';
    const date = toLocalDateString(this.date);

    if (this.kind === 'workout') {
      const dto = { type: this.type, description: this.description || undefined, date };
      const request$ =
        this.mode === 'edit'
          ? this.workoutLogService.updateWorkoutLog(this.entryId!, dto)
          : this.workoutLogService.createWorkoutLog(dto);

      request$.subscribe({
        next: result => {
          if (result.overrodeRestDay) {
            this.snackBar.open(`Replaced your rest day on ${date}.`, 'Dismiss', { duration: 4000 });
          }
          this.onSaved();
        },
        error: () => {
          this.errorMessage = 'Could not save your workout.';
        },
      });
    } else {
      const dto = { note: this.note || undefined, date };
      const request$ =
        this.mode === 'edit'
          ? this.restDayService.update(this.entryId!, dto)
          : this.restDayService.create(dto);

      request$.subscribe({
        next: () => this.onSaved(),
        error: err => {
          this.errorMessage =
            typeof err.error === 'string' ? err.error : 'Could not save your rest day.';
        },
      });
    }
  }
}
