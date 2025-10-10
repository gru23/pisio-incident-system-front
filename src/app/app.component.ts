import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from "./components/map/map.component";
import { HeaderComponent } from './components/header/header.component';
import { MainComponent } from './pages/main/main.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    MapComponent,
    HeaderComponent,
    MainComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'incident-management-system-front';
}
