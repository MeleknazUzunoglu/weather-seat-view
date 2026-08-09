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

  weatherTemperature = 0;
  weatherCloudCover = 0;
  weatherRainChance = 0;

  constructor(
    private weatherService: WeatherService
  ) {}

  showRoute(): void {

    // Haritada rotayı göster
    this.mapComponent.drawRoute(
      this.selectedFrom,
      this.selectedTo,
      this.flightDate,
      this.flightTime
    );

    // Seçilen kalkış havalimanını bul
    const airport = this.airports.find(
      airport => airport.code === this.selectedFrom
    );

    if (!airport) {
      console.error('Airport bulunamadı!');
      return;
    }

    // Seçilen saati al
    const hourIndex = parseInt(
      this.flightTime.split(':')[0],
      10
    );

    // Hava durumu API'sine istek gönder
    this.weatherService.getWeather(
      airport.latitude,
      airport.longitude,
      this.flightDate
    ).subscribe({

      next: (data) => {

        console.log(
          '🌤️ WEATHER API ÇALIŞTI:',
          data
        );

        this.weatherTemperature =
          data.hourly.temperature_2m[hourIndex];

        this.weatherCloudCover =
          data.hourly.cloud_cover[hourIndex];

        this.weatherRainChance =
          data.hourly.precipitation_probability[hourIndex];

      },

      error: (error) => {

        console.error(
          '❌ WEATHER API HATASI:',
          error
        );

      }

    });

  }

}