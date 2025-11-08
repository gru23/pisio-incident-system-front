import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AnalyticsService } from '../../../services/analytics/analytics.service';

interface CityIncidentCount {
  city: string;
  count: number;
}

@Component({
  selector: 'app-incidents-by-city',
  standalone: true,
  imports: [
    BaseChartDirective,
  ],
  templateUrl: './incidents-by-city.component.html',
  styleUrl: './incidents-by-city.component.css'
})
export class IncidentsByCityComponent implements OnInit {
  barChartType: ChartType = 'bar';

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          callback: function(value) {
            return Number(value).toFixed(0);
          }
        }
      }
    }
  };

  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Incidents', 
        backgroundColor: '#3f51b5', 
        hoverBackgroundColor: '#007ed7ff' 
      }
    ]
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getIncidentCountByCity().subscribe({
      next: (data: CityIncidentCount[]) => {
        this.barChartData.labels = data.map(item => item.city);
        this.barChartData.datasets[0].data = data.map(item => item.count);
      },
      error: (err) => {
        console.error('Greška pri učitavanju incidenata po gradu:', err);
      }
    });
  }
}
