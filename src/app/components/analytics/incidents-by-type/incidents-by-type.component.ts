import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AnalyticsService } from '../../../services/analytics/analytics.service';

interface TypeIncidentCount {
  type: string;
  count: number;
}

@Component({
  selector: 'app-incidents-by-type',
  imports: [
    BaseChartDirective,
  ],
  templateUrl: './incidents-by-type.component.html',
  styleUrl: './incidents-by-type.component.css'
})
export class IncidentsByTypeComponent implements OnInit {

  pieChartType: ChartType = 'pie';

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, ctx) => {
          const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1) + '%';
          return `${value} (${percentage})`;
        }
      }
    }
  };

  pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#3f51b5',
          '#e91e63',
          '#ff9800',
          '#4caf50',
          '#9c27b0',
          '#00bcd4'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getIncidentCountByType().subscribe({
      next: (data: TypeIncidentCount[]) => {
        this.pieChartData.labels = data.map(item => item.type);
        this.pieChartData.datasets[0].data = data.map(item => item.count);
      },
      error: (err) => {
        console.error('Greška pri učitavanju incidenata po tipu:', err);
      }
    });
  }
}