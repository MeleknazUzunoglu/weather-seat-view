import { Injectable } from '@angular/core';
import { Airport } from '../models/airport';

export interface FlightInfo {
  distanceKm: number;
  flightTimeMinutes: number;
  headingAngle: number; // Uçağın pusula yönü (0° - 360°)
  directionText: string; // Örn: "Kuzeybatı", "Güneydoğu"
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  // Haversine Formülü ile İki Koordinat Arası Mesafe (Km)
  calculateDistance(from: Airport, to: Airport): number {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
      Math.cos(this.toRadians(to.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  // Pusula Yönü Hesaplama (Bearing / Heading Angle)
  calculateHeading(from: Airport, to: Airport): number {
    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);
    brng = this.toDegrees(brng);
    return Math.round((brng + 360) % 360); // 0-360 derece arası sabitleme
  }

  // Tahmini Uçuş Süresi (Ortalama 800 km/s hız + 30 dk taksi/kalkış-iniş)
  calculateFlightTime(distanceKm: number): number {
    const hours = distanceKm / 800;
    return Math.round(hours * 60 + 30);
  }

  // Pusula Açısını Metne Dönüştürme
  getDirectionText(angle: number): string {
    const directions = ['Kuzey', 'Kuzeydoğu', 'Doğu', 'Güneydoğu', 'Güney', 'Güneybatı', 'Batı', 'Kuzeybatı'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  }

  // Uçuş Özeti Al
  getFlightInfo(from: Airport, to: Airport): FlightInfo {
    const distanceKm = this.calculateDistance(from, to);
    const headingAngle = this.calculateHeading(from, to);
    const flightTimeMinutes = this.calculateFlightTime(distanceKm);
    const directionText = this.getDirectionText(headingAngle);

    return {
      distanceKm,
      flightTimeMinutes,
      headingAngle,
      directionText
    };
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
}