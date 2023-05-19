import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RideService } from 'src/app/shared/ride.service';

@Component({
  selector: 'app-confirmed-ride',
  templateUrl: './confirmed-ride.component.html',
  styleUrls: ['./confirmed-ride.component.scss']
})
export class ConfirmedRideComponent implements OnInit {

  public rideDataList: any = [];
  public fullRideData: any = [];

  private modalRef: NgbModalRef;

  constructor(
    private _rideService: RideService,
    private _modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.getRideData();
  }

  getRideData() {
    this._rideService.getRideData().subscribe({
      next: (response) => {
        this.rideDataList = response.ride;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  cancelRide(id: string) {
    if (confirm("Are you sure you want to cancel the ride")) {
      const rideData = new FormData();
      rideData.append('rideStatus', '0');
      console.log(rideData.get('rideStatus'));
      
      this._rideService.updateRide(id, rideData).subscribe({
        next: (response) => {
          console.log(response);
          this.getRideData();        
        },
        error: (error) => {
          console.log(error);        
        },
        complete: () => {}
      })
    }
  }

  getFullRideInfo(content: any, index: number) {
    this.modalRef = this._modalService.open(content, { centered: true, scrollable: true });
    this.fullRideData = [this.rideDataList[index]];
  }
}
