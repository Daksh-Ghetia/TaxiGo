import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RideService } from 'src/app/shared/ride.service';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.component.html',
  styleUrls: ['./ride-history.component.scss']
})
export class RideHistoryComponent implements OnInit {

  constructor(
    private _rideService: RideService,
    private _modalService: NgbModal
  ) { }

  public rideDataList: any = [];
  public fullRideData: any = [];

  private modalRef: NgbModalRef;

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

  getFullRideInfo(content: any, index: number) {
    this.modalRef = this._modalService.open(content, { centered: true, scrollable: true });
    this.fullRideData = [this.rideDataList[index]];
  }
}
