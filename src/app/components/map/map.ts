import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements AfterViewInit {

  private map!: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    const istanbul: L.LatLngExpression = [41.0082, 28.9784];
    const rome: L.LatLngExpression = [41.9028, 12.4964];

    this.map = L.map('map').setView(istanbul, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker(istanbul)
      .addTo(this.map)
      .bindPopup('İstanbul')
      .openPopup();

    L.marker(rome)
      .addTo(this.map)
      .bindPopup('Roma');

    L.polyline([istanbul, rome], {
      color: 'blue',
      weight: 4
    }).addTo(this.map);

    this.map.fitBounds(
      L.latLngBounds([istanbul, rome]),
      {
        padding: [50, 50]
      }
    );
  }
}