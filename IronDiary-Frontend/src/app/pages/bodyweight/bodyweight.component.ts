import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BodyWeightService } from '../../core/services/body-weight.service';
import { BodyWeightLogDto } from '../../core/models/body-weight.model';
import { ChartRange, dedupeByDay, filterByRange } from '../../core/utils/bodyweight-series.util';
import { toLocalDateString } from '../../core/utils/local-date.util';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// Register Chart.js components once, globally, so BaseChartDirective can render
// the line chart wherever this component is used (app and tests alike).
Chart.register(...registerables);

const CYAN = '#00BCD4';
const ORANGE = '#f98e39';
const TEXT = '#f0f0f0';
const GRID = 'rgba(255, 255, 255, 0.08)';

@Component({
  selector: 'app-bodyweight',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatIconModule,
    BaseChartDirective,
  ],
  templateUrl: './bodyweight.component.html',
  styleUrl: './bodyweight.component.scss'
})
export class BodyweightComponent implements OnInit {
  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  hasData = false;
  isLoading = true;
  range: ChartRange = 'all';

  // Deduped full series, kept in memory so range changes re-filter without refetching.
  private allLogs: BodyWeightLogDto[] = [];

  // Newest-first view of `allLogs` for the list below the chart. Same source as
  // the chart so the two can never disagree; `allLogs` is oldest-first, reversed.
  entries: BodyWeightLogDto[] = [];

  // Add-form models. Weight starts blank; date defaults to today (ADR-0003).
  newWeight: number | null = null;
  newDate = new Date();
  today = new Date(); // datepicker max -- a weigh-in can't be in the future

  // Inline-edit state: the row whose id matches `editingId` swaps its display
  // for weight/date inputs. Null means no row is being edited.
  editingId: number | null = null;
  editWeight: number | null = null;
  editDate = new Date();

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: TEXT } }
    },
    scales: {
      x: { ticks: { color: TEXT }, grid: { color: GRID } },
      y: { ticks: { color: TEXT }, grid: { color: GRID } }
    }
  };

  constructor(
    private bodyWeightService: BodyWeightService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.bodyWeightService.getAll().subscribe({
      next: (logs) => {
        this.allLogs = dedupeByDay(logs);
        this.entries = [...this.allLogs].reverse();
        this.updateChart();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /** A weigh-in needs a positive weight; the date defaults to today. */
  get canAdd(): boolean {
    return this.newWeight != null && this.newWeight > 0;
  }

  // Create a Bodyweight Log on the chosen day, then re-load so the chart and list
  // both refresh from one source. Sends a bare YYYY-MM-DD (ADR-0003).
  addEntry() {
    if (!this.canAdd) {
      return;
    }
    const dto = { weight: this.newWeight!, date: toLocalDateString(this.newDate) };
    this.bodyWeightService.create(dto).subscribe(() => {
      this.newWeight = null;
      this.newDate = new Date();
      this.loadLogs();
    });
  }

  // Open inline edit for a row, prefilled. Parse the date to LOCAL midnight so
  // the day never shifts (ADR-0003).
  startEdit(entry: BodyWeightLogDto) {
    const [y, m, d] = entry.date.slice(0, 10).split('-').map(Number);
    this.editingId = entry.id;
    this.editWeight = entry.weight;
    this.editDate = new Date(y, m - 1, d);
  }

  cancelEdit() {
    this.editingId = null;
  }

  /** An edit needs a positive weight, same as a new weigh-in. */
  get canSaveEdit(): boolean {
    return this.editWeight != null && this.editWeight > 0;
  }

  // Persist the inline edit with a single PUT, then re-load so the chart and
  // list both refresh. Sends a bare YYYY-MM-DD (ADR-0003).
  saveEdit() {
    if (this.editingId == null || !this.canSaveEdit) {
      return;
    }
    const dto = { weight: this.editWeight!, date: toLocalDateString(this.editDate) };
    this.bodyWeightService.update(this.editingId, dto).subscribe(() => {
      this.editingId = null;
      this.loadLogs();
    });
  }

  // Editing a weigh-in is delete + re-add (no PUT on BodyWeightLog). Confirm via
  // the shared dialog, then re-load so the chart and list both refresh.
  deleteEntry(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete weigh-in?',
        message: 'This permanently removes this bodyweight entry.',
        confirmText: 'Delete',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }
      this.bodyWeightService.delete(id).subscribe(() => this.loadLogs());
    });
  }

  setRange(range: ChartRange) {
    this.range = range;
    this.updateChart();
  }

  // Re-derives the chart series from the in-memory deduped logs for the current
  // range. No HTTP -- switching the window never refetches.
  private updateChart() {
    const series = filterByRange(this.allLogs, this.range, new Date());
    this.hasData = series.length > 0;
    this.lineChartData = {
      labels: series.map(l => l.date.slice(0, 10)),
      datasets: [
        {
          data: series.map(l => l.weight),
          label: 'Weight (lbs)',
          borderColor: CYAN,
          pointBackgroundColor: ORANGE,
          pointBorderColor: ORANGE,
          tension: 0.3
        }
      ]
    };
  }
}
