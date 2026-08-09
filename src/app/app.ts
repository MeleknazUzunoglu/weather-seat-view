import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './services/weather.service';

import { MapComponent } from './components/map/map';
import { AIRPORTS } from './data/airports';
import { SeatMapComponent } from './components/seat-map/seat-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MapComponent,
    SeatMapComponent
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

  today = new Date().toISOString().split('T')[0];

  // Flight status
  flightStatus = '';

  // Weather
  weatherTemperature = 0;
  weatherCloudCover = 0;
  weatherRainChance = 0;

  constructor(
    private weatherService: WeatherService
  ) {}

  showRoute(): void {

    // Geçmiş tarih kontrolü
    if (this.flightDate < this.today) {

      alert(
        'Geçmiş bir tarih için uçuş planlanamaz.'
      );

      return;
    }

    // Aynı havalimanı kontrolü
    if (this.selectedFrom === this.selectedTo) {

      alert(
        'Kalkış ve varış havalimanı aynı olamaz.'
      );

      return;
    }

    // Uçuş durumunu hesapla
    this.flightStatus =
      this.calculateFlightStatus();

    // Haritayı güncelle
    this.mapComponent.drawRoute(
      this.selectedFrom,
      this.selectedTo,
      this.flightDate,
      this.flightTime
    );

    // Kalkış havalimanını bul
    const airport = this.airports.find(
      airport => airport.code === this.selectedFrom
    );

    if (!airport) {

      console.error(
        'Airport bulunamadı!'
      );

      return;
    }

    // Saat bilgisini al
    const hourIndex = parseInt(
      this.flightTime.split(':')[0],
      10
    );

    // Hava durumunu getir
    this.weatherService.getWeather(
      airport.latitude,
      airport.longitude,
      this.flightDate
    ).subscribe({

      next: (data: any) => {

        this.weatherTemperature =
          data.hourly.temperature_2m[hourIndex];

        this.weatherCloudCover =
          data.hourly.cloud_cover[hourIndex];

        this.weatherRainChance =
          data.hourly.precipitation_probability[hourIndex];

        console.log(
          '🌤️ Weather data:',
          data
        );
      },

      error: (error) => {

        console.error(
          '❌ Weather API error:',
          error
        );

      }

    });
  }

  private calculateFlightStatus(): string {

    const hour = parseInt(
      this.flightTime.split(':')[0],
      10
    );

    if (hour >= 6 && hour < 10) {
      return '🌅 Morning Flight';
    }

    if (hour >= 10 && hour < 18) {
      return '☀️ Day Flight';
    }

    if (hour >= 18 && hour < 21) {
      return '🌇 Evening Flight';
    }

    return '🌙 Night Flight';
  }
}