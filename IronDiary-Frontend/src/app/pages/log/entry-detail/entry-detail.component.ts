import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { WorkoutLogService } from '../../../core/services/workout-log.service';
import { RestDayService } from '../../../core/services/rest-day.service';
import { WorkoutLogDetailDto } from '../../../core/models/workout-log.model';
import { RestDayDto } from '../../../core/models/rest-day.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-entry-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './entry-detail.component.html',
  styleUrl: './entry-detail.component.scss',
})
export class EntryDetailComponent implements OnInit {
  kind!: 'workout' | 'rest';
  id!: number;
  workout: WorkoutLogDetailDto | null = null;
  rest: RestDayDto | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private workoutLogService: WorkoutLogService,
    private restDayService: RestDayService
  ) {}

  ngOnInit() {
    this.kind = this.route.snapshot.data['kind'];
    this.id = Number(this.route.snapshot.paramMap.get('id'));

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
