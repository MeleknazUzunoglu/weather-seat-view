import {
  AfterViewInit,
  Component
} from '@angular/core';

import * as L from 'leaflet';

import { AIRPORTS } from '../../data/airports';
import { Airport } from '../../models/airport';


delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png'
});


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements AfterViewInit {

  private map!: L.Map;

  private routeLine?: L.Polyline;

  private markers: L.Marker[] = [];


  ngAfterViewInit(): void {

    this.initMap();

  }


  private initMap(): void {

    this.map = L.map('map').setView(
      [41.0082, 28.9784],
      5
    );


    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

  }


  drawRoute(
    fromCode: string,
    toCode: string
  ): void {

    if (!this.map) {
      return;
    }


    const fromAirport = AIRPORTS.find(
      airport => airport.code === fromCode
    );

    const toAirport = AIRPORTS.find(
      airport => airport.code === toCode
    );


    if (!fromAirport || !toAirport) {

      console.error(
        'Airport not found:',
        fromCode,
        toCode
      );

      return;

    }


    this.clearRoute();


    const from: L.LatLngExpression = [
      fromAirport.latitude,
      fromAirport.longitude
    ];


    const to: L.LatLngExpression = [
      toAirport.latitude,
      toAirport.longitude
    ];


    const fromMarker = L.marker(from)
      .addTo(this.map)
      .bindPopup(
        `${fromAirport.city}<br>${fromAirport.name}`
      );


    const toMarker = L.marker(to)
      .addTo(this.map)
      .bindPopup(
        `${toAirport.city}<br>${toAirport.name}`
      );


    this.markers.push(
      fromMarker,
      toMarker
    );


    this.routeLine = L.polyline(
      [from, to],
      {
        color: 'blue',
        weight: 4
      }
    ).addTo(this.map);


    this.map.fitBounds(
      L.latLngBounds(
        [from, to]
      ),
      {
        padding: [50, 50]
      }
    );


    fromMarker.openPopup();

  }


  private clearRoute(): void {

    this.markers.forEach(
      marker => marker.remove()
    );

    this.markers = [];


    if (this.routeLine) {

      this.routeLine.remove();

      this.routeLine = undefined;

    }

  }

}