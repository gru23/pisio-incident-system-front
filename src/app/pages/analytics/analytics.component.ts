import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { IncidentsByCityComponent } from '../../components/analytics/incidents-by-city/incidents-by-city.component';
import { IncidentsByTypeComponent } from '../../components/analytics/incidents-by-type/incidents-by-type.component';
import { MonthlyIncidentsComponent } from '../../components/analytics/monthly-incidents/monthly-incidents.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    MatTabsModule,
    IncidentsByCityComponent,
    IncidentsByTypeComponent,
    MonthlyIncidentsComponent
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent {

}
