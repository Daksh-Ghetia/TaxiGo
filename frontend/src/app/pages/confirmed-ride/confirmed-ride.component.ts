import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/shared/driver.service';
import { RideService } from 'src/app/shared/ride.service';
import { VehicleTypeService } from 'src/app/shared/vehicle-type.service';
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
  public vehicleTypeList: any = [];
  public selectedRowIndex: number;
  public rideDetails: any;
  public message: any;
  public focus:any;
  public rideFilter: FormGroup;
  public p: number = 1;
  public totalRecordLength: number;

  private modalRef: NgbModalRef;

  constructor(
    private _rideService: RideService,
    private _driverService: DriverService,
    private _modalService: NgbModal,
    private _toastrService: ToastrService,
    private _webSocketService: WebSocketService,
    private _vehicleTypeService: VehicleTypeService
  ) { }

  ngOnInit(): void {
    // this.getRideData();
    this.listenToSocket();
    this.getVehicalTypeList();

    this.rideFilter = new FormGroup({
      rideSearchData: new FormControl(null, []),
      rideStatus: new FormControl(null, []),
      rideVehicleType: new FormControl(null, []),
      rideFromDate: new FormControl(null, []),
      rideToDate : new FormControl(null, []),
    })
  }

  ngAfterViewInit() {
    this.getRideData();
  }

  getRideData() {
    let toDate: any;
    if (this.rideFilter.get('rideToDate').value) {
      const dateObject = new Date(this.rideFilter.get('rideToDate').value);
      dateObject.setHours(23);
      dateObject.setMinutes(59);
      dateObject.toISOString();
      toDate = dateObject.toISOString();
    }
    const rideFilterData = {
      rideSearchData: this.rideFilter.get('rideSearchData').value || "null",
      rideStatus: this.rideFilter.get('rideStatus').value || "null",
      rideVehicleType: this.rideFilter.get('rideVehicleType').value || "null",
      rideFromDate: this.rideFilter.get('rideFromDate').value || "null",
      rideToDate: toDate || "null"
    }
    this._rideService.getRideData([1,2,3],rideFilterData, this.p-1).subscribe({
      next: (response) => {
        if (response.ride.length == 0) {
          this.rideDataList = [];
          return this._toastrService.error("No ride to display");
        }
        this.rideDataList = response.ride;
        this.totalRecordLength = response.totalRecord ? response.totalRecord : response.ride.length;
      },
      error: (error) => {
        this.rideDataList = []
        this._toastrService.error(error.error.msg || "Error occured while getting data");
        console.log(error);
      },
      complete: () => {}
    })
  }

  cancelSearch() {
    this.rideFilter.reset();
    this.getRideData();
  }

  getVehicalTypeList() {
    this._vehicleTypeService.getVehicleType().subscribe({
      next: (response) => {
        if (response.vehicle.length == 0) {
          return this._toastrService.info("No vehicle type to display for filter. Add new vehicle type to display");
        }
        this.vehicleTypeList = response.vehicle;
      },
      error: (error) => {console.log(error);},
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
          this._toastrService.error("Ride has been cancelled successfully.");
        },
        error: (error) => {
          this._toastrService.error("Error occured while canceling the ride");
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
          this._toastrService.info("There are no drivers providing the facilities required by the customer", "Driver not found")
        }
        this.driverList =  response.driver;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting available driver list.");
      },
      complete: () => {}
    })
  }

  assignSelectedDriver() {
    if (this.selectedRowIndex === undefined) {
      return this._toastrService.info("please select a driver to assign", "Driver not selected");
    }

    this._webSocketService.emit('assignSelectedDriver', {driver: this.driverList[this.selectedRowIndex], rideDriverAssignType: 1, ride: this.rideDetails});
    this.modalRef.close();
    this.getRideData();
  }

  assignRandomDriver() {
    if (this.driverList.length == 0) {
      return this._toastrService.info("Currently there are no drivers available for selection", "Driver not found");
    }

    this._webSocketService.emit('assignRandomDriver', {rideDriverAssignType: 2, ride: this.rideDetails});
    // this._toastrService.success("Nearest driver assigning succesful", "");
    this.modalRef.close();
    this.getRideData();
  }

  searchRide() {
    let toDate: any;
    if (this.rideFilter.get('rideToDate').value) {
      const dateObject = new Date(this.rideFilter.get('rideToDate').value);
      dateObject.setHours(23);
      dateObject.setMinutes(59);
      dateObject.toISOString();
      toDate = dateObject.toISOString();
    }
    const rideFilterData = {
      rideSearchData: this.rideFilter.get('rideSearchData').value || "null",
      rideStatus: this.rideFilter.get('rideStatus').value || "null",
      rideVehicleType: this.rideFilter.get('rideVehicleType').value || "null",
      rideFromDate: this.rideFilter.get('rideFromDate').value || "null",
      rideToDate: toDate || "null"
    }

    this._rideService.getRideData([1,2,3],rideFilterData, 0).subscribe({
      next: (response) => {
        if (response.ride.length == 0) {
          this.rideDataList = [];
          return this._toastrService.error("No ride to display");
        }
        this.totalRecordLength = response.totalRecord ? response.totalRecord : response.ride.length;
        this.rideDataList = response.ride;
        this.p = 1;
      },
      error: (error) => {
        this.rideDataList = []
        this._toastrService.error(error.error.msg || "Error occured while getting data");
        console.log(error);
      },
      complete: () => {}
    })
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

    this._webSocketService.listen('driverAssigned').subscribe({
      next: () => {
        this._toastrService.success("Driver Assigned successfully");
      },
      error: () => {
        this._toastrService.error("Error occured while assigning driver");
      }
    })

    this._webSocketService.listen('driverAcceptRequest').subscribe({
      next: () => {
        this._toastrService.success("Congratulations driver accepted the request");
      }
    })

    this._webSocketService.listen('errorOccured').subscribe({
      next: (response: any) => {
        this._toastrService.error(response || "Error occured in socket");
      }
    })
  }
}
