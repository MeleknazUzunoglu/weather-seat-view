import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [],
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.css'
})
export class SeatMapComponent implements OnChanges {

  @Input() recommendedSide = '';

  seats = [
    'A', 'B', 'C',
    'D', 'E', 'F'
  ];

  rows = Array.from(
    { length: 10 },
    (_, index) => index + 1
  );

  recommendedSeats: string[] = [];

  selectedSeat = '';

  seatMessage = '';


  ngOnChanges(): void {
    this.updateRecommendedSeats();
  }


  private updateRecommendedSeats(): void {

    if (this.recommendedSide === 'Right') {

      this.recommendedSeats = [
        'D', 'E', 'F'
      ];

    } else if (this.recommendedSide === 'Left') {

      this.recommendedSeats = [
        'A', 'B', 'C'
      ];

    } else {

      this.recommendedSeats = [];

    }

  }


  isRecommended(
    row: number,
    seat: string
  ): boolean {

    return this.recommendedSeats.includes(seat);

  }


  selectSeat(
    row: number,
    seat: string
  ): void {

    this.selectedSeat = `${seat}${row}`;

    if (this.isRecommended(row, seat)) {

      this.seatMessage =
        '✅ This seat is recommended for the best view.';

    } else {

      this.seatMessage =
        '⚠️ This seat is not on the recommended side.';

    }

  }


  isSelected(
    row: number,
    seat: string
  ): boolean {

    return this.selectedSeat === `${seat}${row}`;

  }

}