import { Component, OnInit } from '@angular/core';
import { RideService } from 'src/app/shared/ride.service';

@Component({
  selector: 'app-confirmed-ride',
  templateUrl: './confirmed-ride.component.html',
  styleUrls: ['./confirmed-ride.component.scss']
})
export class ConfirmedRideComponent implements OnInit {

  public rideDataList: any = [];

  constructor(private _rideService: RideService) { }

  ngOnInit(): void {
    this.getRideData();
  }

  getRideData() {
    this._rideService.getRideData().subscribe({
      next: (response) => {
        console.log(response);
        console.log(response.ride);
        this.rideDataList = response.ride;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }
}
