import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/shared/driver.service';
import { RideService } from 'src/app/shared/ride.service';

@Component({
  selector: 'app-confirmed-ride',
  templateUrl: './confirmed-ride.component.html',
  styleUrls: ['./confirmed-ride.component.scss']
})
export class ConfirmedRideComponent implements OnInit {

  public rideDataList: any = [];
  public fullRideData: any = [];
  public driverList: any = [];
  public selectedRowIndex: number;
  
  private modalRef: NgbModalRef;

  constructor(
    private _rideService: RideService,
    private _driverService: DriverService,
    private _modalService: NgbModal,
    private _toastrServie: ToastrService
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
      
      this._rideService.updateRide(id, rideData).subscribe({
        next: (response) => {
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

  getDriverDetailsForRide(content: any, rideServiceTypeId: string, rideCityId: string, index: number) {
    this.modalRef = this._modalService.open(content, { size: 'lg', centered: true, scrollable: true });
    this.selectedRowIndex = undefined;
    this.fullRideData = [this.rideDataList[index]];
    this._driverService.getDriverDetailsForRide(rideServiceTypeId, rideCityId).subscribe({
      next: (response) => {
        if (response.driver.length <= 0) {
          this._toastrServie.info("There are no drivers providing the facilities required by the customer", "Driver not found")
        }
        this.driverList =  response.driver;
        console.log(this.driverList);        
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }
}
