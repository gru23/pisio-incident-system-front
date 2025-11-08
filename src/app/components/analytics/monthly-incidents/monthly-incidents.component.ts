import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics/analytics.service';
import { IncidentPerDayModel } from '../../../models/analytics/incident-per-day-model';
import { IncidentType } from '../../../enums';

@Component({
  selector: 'app-monthly-incidents',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './monthly-incidents.component.html',
  styleUrl: './monthly-incidents.component.css'
})
export class MonthlyIncidentsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  years: number[] = [];
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  selectedYear!: number;
  selectedMonth!: number;

  private readonly typeColors: Record<IncidentType, string> = {
    [IncidentType.Fire]: '#e53935',
    [IncidentType.Flood]: '#1e88e5',
    [IncidentType.Accident]: '#fbc02d',
    [IncidentType.Crime]: '#43a047'
  };

  lineChartType: ChartType = 'line';

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            if (!tooltipItems.length) return '';
            const day = tooltipItems[0].label;
            const monthName = new Date(this.selectedYear, this.selectedMonth - 1)
              .toLocaleString('en-US', { month: 'short' });
            return `${day.padStart(2, '0')}. ${monthName} ${this.selectedYear}`;
          },
          label: (tooltipItem) => {
            const type = tooltipItem.dataset.label ?? 'Incidents';
            return `${type}: ${tooltipItem.formattedValue}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of incidents' },
        ticks: { stepSize: 1, precision: 0 }
      },
      x: {
        title: { display: true, text: 'Day of Month' }
      }
    }
  };

  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    this.loadData();
  }

  loadData(): void {
    this.analyticsService.getIncidentCountByMonth(this.selectedYear, this.selectedMonth).subscribe({
      next: (data: IncidentPerDayModel[]) => {
        console.log('Backend data:', data);

        const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
        const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        this.lineChartData.labels = labels;

        const groupedByType = data.reduce((acc, item) => {
          const typeKey = item.type.toUpperCase();
          if (!acc[typeKey]) acc[typeKey] = [];
          acc[typeKey].push(item);
          return acc;
        }, {} as Record<string, IncidentPerDayModel[]>);

        const datasets = Object.entries(groupedByType).map(([type, incidents]) => {
          const color = this.typeColors[type as IncidentType] ?? '#888';
          const counts = labels.map(dayLabel => {
            const found = incidents.find(d => d.day === +dayLabel);
            return found ? found.count : 0;
          });

          return {
            data: counts,
            label: type,
            borderColor: color,
            backgroundColor: color + '33',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          };
        });

        this.lineChartData.datasets = datasets;
        this.lineChartData = { ...this.lineChartData };
        this.chart?.update();

        console.log('Datasets:', this.lineChartData.datasets);
      },
      error: (err) => console.error('Reading monthly incidents error:', err)
    });
  }
}
