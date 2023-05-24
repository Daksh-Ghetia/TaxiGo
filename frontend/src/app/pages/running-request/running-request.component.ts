import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RideService } from 'src/app/shared/ride.service';

@Component({
  selector: 'app-running-request',
  templateUrl: './running-request.component.html',
  styleUrls: ['./running-request.component.scss']
})
export class RunningRequestComponent implements OnInit {

  public rideDataList: any = [];
  public fullRideData: any = [];

  private modalRef: NgbModalRef;

  constructor(
    private _rideService: RideService,
    private _toastrService: ToastrService,
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

  getFullRideInfo(content: any, index: number) {
    this.modalRef = this._modalService.open(content, { centered: true, scrollable: true });
    this.fullRideData = [this.rideDataList[index]];
  }

  clickCheck() {
    console.log("click working");
    
  }
}
