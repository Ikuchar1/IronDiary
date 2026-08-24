import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { WorkoutLogService } from '../../../core/services/workout-log.service';
import { RestDayService } from '../../../core/services/rest-day.service';
import { WorkoutPhotoService } from '../../../core/services/workout-photo.service';
import { WorkoutLogDetailDto, WorkoutPhotoDto } from '../../../core/models/workout-log.model';
import { RestDayDto } from '../../../core/models/rest-day.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EntryFormComponent } from '../entry-form/entry-form.component';

@Component({
  selector: 'app-entry-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, EntryFormComponent],
  templateUrl: './entry-detail.component.html',
  styleUrl: './entry-detail.component.scss',
})
export class EntryDetailComponent implements OnInit {
  kind!: 'workout' | 'rest';
  id!: number;
  workout: WorkoutLogDetailDto | null = null;
  rest: RestDayDto | null = null;
  isLoading = true;
  isEditing = false;
  // Stable Date reference handed to the edit form. Must NOT be a getter that
  // builds a new Date per read — that changes the @Input reference every change
  // detection tick and spins an infinite loop. Set once when editing begins.
  editDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private workoutLogService: WorkoutLogService,
    private restDayService: RestDayService,
    private workoutPhotoService: WorkoutPhotoService
  ) {}

  ngOnInit() {
    this.kind = this.route.snapshot.data['kind'];
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  private load() {
    if (this.kind === 'workout') {
      this.workoutLogService.getWorkoutLogById(this.id).subscribe(w => {
        this.workout = w;
        this.isLoading = false;
      });
    } else {
      this.restDayService.getById(this.id).subscribe(r => {
        this.rest = r;
        this.isLoading = false;
      });
    }
  }

  back() {
    this.router.navigate(['/log']);
  }

  edit() {
    this.editDate = this.parseLocalDate(this.kind === 'workout' ? this.workout?.date : this.rest?.date);
    this.isEditing = true;
  }

  /**
   * Parse the API's date into a Date at LOCAL midnight (ADR-0003). The API
   * serializes a full ISO8601 timestamp ('2026-06-11T00:00:00Z'), so take the
   * calendar-day part before 'T' and rebuild from local parts. Feeding the raw
   * string to `new Date()` would apply the timezone offset and could shift the
   * day; splitting the day out keeps the logged calendar date intact.
   */
  private parseLocalDate(iso?: string): Date {
    if (!iso) {
      return new Date();
    }
    const [y, m, d] = iso.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /** A successful edit re-fetches the entry and returns to the read-only view. */
  onSaved() {
    this.isEditing = false;
    this.load();
  }

  /**
   * Photos are an independent resource (ADR-0005), so a removal commits
   * immediately rather than waiting on the edit form's Save. On success the
   * photo is dropped from the local array — no re-fetch, so the grid updates
   * without a round-trip flicker.
   */
  removePhoto(photo: WorkoutPhotoDto) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove photo?',
        message: 'This permanently removes this photo from the workout.',
        confirmText: 'Remove',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }
      this.workoutPhotoService.delete(photo.id).subscribe(() => {
        if (this.workout) {
          this.workout.photos = this.workout.photos.filter(p => p.id !== photo.id);
        }
      });
    });
  }

  delete() {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete entry?',
        message: 'This permanently removes this entry.',
        confirmText: 'Delete',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }
      const delete$ =
        this.kind === 'workout'
          ? this.workoutLogService.deleteWorkoutLog(this.id)
          : this.restDayService.delete(this.id);

      delete$.subscribe(() => this.router.navigate(['/log']));
    });
  }
}
