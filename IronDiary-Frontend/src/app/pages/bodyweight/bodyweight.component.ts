import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BodyWeightService } from '../../core/services/body-weight.service';
import { BodyWeightLogDto } from '../../core/models/body-weight.model';
import { ChartRange, dedupeByDay, filterByRange } from '../../core/utils/bodyweight-series.util';

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
  imports: [CommonModule, MatButtonToggleModule, BaseChartDirective],
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

  constructor(private bodyWeightService: BodyWeightService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.bodyWeightService.getAll().subscribe({
      next: (logs) => {
        this.allLogs = dedupeByDay(logs);
        this.updateChart();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
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
