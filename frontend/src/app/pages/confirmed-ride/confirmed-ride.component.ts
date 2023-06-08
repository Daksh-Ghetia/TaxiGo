import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/shared/driver.service';
import { MessagingService } from 'src/app/shared/messaging.service';
import { RideService } from 'src/app/shared/ride.service';
import { WebSocketService } from 'src/app/shared/web-socket.service';

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
  public rideDetails: any;
  public message: any;
  
  private modalRef: NgbModalRef;

  constructor(
    private _rideService: RideService,
    private _driverService: DriverService,
    private _modalService: NgbModal,
    private _toastrServie: ToastrService,
    private _webSocketService: WebSocketService,
    private _messagingService: MessagingService,
  ) { }

  ngOnInit(): void {
    this.getRideData();
    this.listenToSocket();

    //Do not delete
    // this._messagingService.requestPermission();
    // this._messagingService.receiveMessaging();
    // this.message = this._messagingService.currentMessage;
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

  getDriverDetailsForRide(content: any, ride: any, index: number) {
    this.modalRef = this._modalService.open(content, { size: 'lg', centered: true, scrollable: true });
    this.selectedRowIndex = undefined;
    this.fullRideData = [this.rideDataList[index]];
    this.getAvailableDriver(ride);
  }

  getAvailableDriver(ride: any) {
    this._driverService.getDriverDetailsForRide(ride.rideServiceTypeId, ride.rideCityId).subscribe({
      next: (response) => {
        if (response.driver.length <= 0) {
          this._toastrServie.info("There are no drivers providing the facilities required by the customer", "Driver not found")
        }
        this.driverList =  response.driver;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  assignSelectedDriver() {
    if (this.selectedRowIndex === undefined) {
      return this._toastrServie.info("please select a driver to assign", "Driver not selected");
    }
    
    this._webSocketService.emit('assignSelectedDriver', {driver: this.driverList[this.selectedRowIndex], rideDriverAssignType: 1, ride: this.rideDetails});
    this.modalRef.close();
    this.getRideData();
  }

   assignRandomDriver() {
      if (this.driverList.length == 0) {
        return this._toastrServie.info("Currently there are no drivers available for selection", "Driver not found");
      }

      this._webSocketService.emit('assignRandomDriver', {rideDriverAssignType: 2, ride: this.rideDetails});
      this._toastrServie.success("Nearest driver assigning succesful", "");
      this.modalRef.close();
      this.getRideData();
   }

  listenToSocket() {
    this._webSocketService.listen('dataChange').subscribe({
      next: () => {
        this.getRideData();
        if (this._modalService.hasOpenModals()) {
          this.getAvailableDriver(this.rideDetails);
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }
}
