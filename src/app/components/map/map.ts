import {
  AfterViewInit,
  Component
} from '@angular/core';

import * as L from 'leaflet';

import { AIRPORTS } from '../../data/airports';

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

  distanceKm = 0;

  flightTime = '';


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


    // Mesafeyi hesapla
    this.distanceKm = this.calculateDistance(
      fromAirport.latitude,
      fromAirport.longitude,
      toAirport.latitude,
      toAirport.longitude
    );


    // Tahmini uçuş süresini hesapla
    this.flightTime = this.calculateFlightTime(
      this.distanceKm
    );


    // Kalkış marker
    const fromMarker = L.marker(from)
      .addTo(this.map)
      .bindPopup(
        `${fromAirport.city}<br>${fromAirport.name}`
      );


    // Varış marker
    const toMarker = L.marker(to)
      .addTo(this.map)
      .bindPopup(
        `${toAirport.city}<br>${toAirport.name}`
      );


    this.markers.push(
      fromMarker,
      toMarker
    );


    // Uçuş rotası
    this.routeLine = L.polyline(
      [from, to],
      {
        color: 'blue',
        weight: 4
      }
    ).addTo(this.map);


    // Haritayı iki noktayı gösterecek şekilde ayarla
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


  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {

    const earthRadius = 6371;

    const dLat = this.toRadians(
      lat2 - lat1
    );

    const dLon = this.toRadians(
      lon2 - lon1
    );


    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;


    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );


    return Math.round(
      earthRadius * c
    );

  }


  private toRadians(
    degrees: number
  ): number {

    return degrees * Math.PI / 180;

  }


  private calculateFlightTime(
    distanceKm: number
  ): string {

    const averageSpeed = 800;

    const hours =
      distanceKm / averageSpeed;


    const wholeHours =
      Math.floor(hours);


    const minutes =
      Math.round(
        (hours - wholeHours) * 60
      );


    return `${wholeHours}h ${minutes}m`;

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