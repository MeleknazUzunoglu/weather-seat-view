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

  sunAzimuth = 0;

  sunSide = '';

  flightBearing = 0;


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
    toCode: string,
    flightDate: string,
    flightTime: string
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


    // Uçuş yönü
    this.flightBearing =
      this.calculateBearing(
        fromAirport.latitude,
        fromAirport.longitude,
        toAirport.latitude,
        toAirport.longitude
      );


    // Güneş yönü
    this.sunAzimuth =
      this.calculateSunAzimuth(
        fromAirport.latitude,
        fromAirport.longitude,
        flightDate,
        flightTime
      );


    // Güneşin uçağın hangi tarafında olduğu
    this.sunSide =
      this.calculateSunSide(
        this.flightBearing,
        this.sunAzimuth
      );


    // Mesafe
    this.distanceKm =
      this.calculateDistance(
        fromAirport.latitude,
        fromAirport.longitude,
        toAirport.latitude,
        toAirport.longitude
      );


    // Tahmini uçuş süresi
    this.flightTime =
      this.calculateFlightTime(
        this.distanceKm
      );


    // Kalkış marker
    const fromMarker =
      L.marker(from)
        .addTo(this.map)
        .bindPopup(
          `${fromAirport.city}<br>${fromAirport.name}`
        );


    // Varış marker
    const toMarker =
      L.marker(to)
        .addTo(this.map)
        .bindPopup(
          `${toAirport.city}<br>${toAirport.name}`
        );


    this.markers.push(
      fromMarker,
      toMarker
    );


    // Uçuş rotası
    this.routeLine =
      L.polyline(
        [from, to],
        {
          color: 'blue',
          weight: 4
        }
      ).addTo(this.map);


    // Haritayı rotaya göre ayarla
    this.map.fitBounds(
      L.latLngBounds([from, to]),
      {
        padding: [50, 50]
      }
    );


    fromMarker.openPopup();

  }


  // Mesafe hesaplama
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {

    const earthRadius = 6371;

    const dLat =
      this.toRadians(lat2 - lat1);

    const dLon =
      this.toRadians(lon2 - lon1);


    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;


    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );


    return Math.round(
      earthRadius * c
    );

  }


  // Derece -> radyan
  private toRadians(
    degrees: number
  ): number {

    return degrees * Math.PI / 180;

  }


  // Uçuş süresi
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


  // Uçuş yönü
  private calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {

    const startLat =
      this.toRadians(lat1);

    const endLat =
      this.toRadians(lat2);

    const deltaLon =
      this.toRadians(
        lon2 - lon1
      );


    const y =
      Math.sin(deltaLon) *
      Math.cos(endLat);


    const x =
      Math.cos(startLat) *
      Math.sin(endLat) -
      Math.sin(startLat) *
      Math.cos(endLat) *
      Math.cos(deltaLon);


    let bearing =
      Math.atan2(y, x) *
      180 /
      Math.PI;


    bearing =
      (bearing + 360) % 360;


    return Math.round(bearing);

  }


  // Güneş azimutu
  private calculateSunAzimuth(
    latitude: number,
    longitude: number,
    date: string,
    time: string
  ): number {

    const dateTime =
      new Date(
        `${date}T${time}:00`
      );


    const dayOfYear =
      Math.floor(
        (
          Date.UTC(
            dateTime.getFullYear(),
            dateTime.getMonth(),
            dateTime.getDate()
          ) -
          Date.UTC(
            dateTime.getFullYear(),
            0,
            0
          )
        ) /
        86400000
      );


    const hour =
      dateTime.getHours() +
      dateTime.getMinutes() / 60;


    // Güneş deklinasyonu
    const declination =
      23.44 *
      Math.sin(
        this.toRadians(
          (360 / 365) *
          (dayOfYear - 81)
        )
      );


    // Yaklaşık yerel güneş zamanı
    const solarTime =
      hour +
      longitude / 15;


    const hourAngle =
      15 *
      (solarTime - 12);


    const latRad =
      this.toRadians(latitude);

    const decRad =
      this.toRadians(declination);

    const hourAngleRad =
      this.toRadians(hourAngle);


    // Güneş yüksekliği
    Math.asin(
      Math.sin(latRad) *
      Math.sin(decRad) +
      Math.cos(latRad) *
      Math.cos(decRad) *
      Math.cos(hourAngleRad)
    );


    // Güneş azimutu
    const azimuth =
      Math.atan2(
        Math.sin(hourAngleRad),
        Math.cos(hourAngleRad) *
        Math.sin(latRad) -
        Math.tan(decRad) *
        Math.cos(latRad)
      );


    let degrees =
      azimuth *
      180 /
      Math.PI +
      180;


    degrees =
      (degrees + 360) % 360;


    return Math.round(degrees);

  }


  // Güneşin uçağın hangi tarafında olduğu
  private calculateSunSide(
    flightBearing: number,
    sunAzimuth: number
  ): string {

    let difference =
      (sunAzimuth - flightBearing + 360) % 360;


    if (difference > 180) {
      difference -= 360;
    }


    if (difference > 10) {
      return 'Right';
    }


    if (difference < -10) {
      return 'Left';
    }


    return 'Front';

  }


  // Eski rota ve markerları temizle
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