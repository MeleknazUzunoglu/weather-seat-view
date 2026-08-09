import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    cloud_cover: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiUrl =
    'https://api.open-meteo.com/v1/forecast';

  constructor(
    private http: HttpClient
  ) {}

  getWeather(
    latitude: number,
    longitude: number,
    date: string
  ): Observable<WeatherData> {

    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set(
        'hourly',
        'temperature_2m,precipitation_probability,cloud_cover'
      )
      .set('start_date', date)
      .set('end_date', date)
      .set('timezone', 'auto');

    return this.http.get<WeatherData>(
      this.apiUrl,
      { params }
    );
  }

}