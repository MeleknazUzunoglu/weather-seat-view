import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MapComponent } from './components/map/map';
import { AIRPORTS } from './data/airports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MapComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  @ViewChild(MapComponent)
  mapComponent!: MapComponent;

  airports = AIRPORTS;

  selectedFrom = 'IST';
  selectedTo = 'FCO';

  flightDate = '2026-08-08';
  flightTime = '12:00';
  
  showRoute(): void {

   this.mapComponent.drawRoute(
  this.selectedFrom,
  this.selectedTo,
  this.flightDate,
  this.flightTime
);

  }
}