import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RideService } from 'src/app/shared/ride.service';
import { VehicleTypeService } from 'src/app/shared/vehicle-type.service';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.component.html',
  styleUrls: ['./ride-history.component.scss']
})
export class RideHistoryComponent implements OnInit {

  constructor(
    private _rideService: RideService,
    private _toastrService: ToastrService,
    private _modalService: NgbModal,
    private _vehicleTypeService: VehicleTypeService
  ) { }

  public rideDataList: any = [];
  public fullRideData: any = [];
  public vehicleTypeList: any = [];
  public rideFilter: FormGroup;
  public focus:any;
  public p: number;
  public totalRecordLength: number;

  private modalRef: NgbModalRef;

  /**Map variables */
  private map: google.maps.Map;
  private directionsService = new google.maps.DirectionsService();
  private directionsRenderer = new google.maps.DirectionsRenderer();
  private wayPts: google.maps.DirectionsWaypoint[] = [];

  ngOnInit(): void {
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
    this.getVehicalTypeList();
  }

  getRideData() {
    const rideFilterData = {
      rideSearchData: this.rideFilter.get('rideSearchData').value || "null",
      rideStatus: this.rideFilter.get('rideStatus').value || "null",
      rideVehicleType: this.rideFilter.get('rideVehicleType').value || "null",
      rideFromDate: this.rideFilter.get('rideFromDate').value || "null",
      rideToDate: this.rideFilter.get('rideToDate').value || "null"
    }
    console.log("getRide");
    this._rideService.getRideData([0,7],rideFilterData).subscribe({
      next: (response) => {
        if (response.ride.length <= 0) {
          return this._toastrService.info("Currently there are no rides to display", "")
        }
        this.rideDataList = response.ride;
        this.totalRecordLength = response.ride.length;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting ride data.");
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
          return this._toastrService.info("Please add vehicle type in order to display");
        }
        this.vehicleTypeList = response.vehicle;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting vehicle type for filter");
      },
      complete: () => {}
    })
  }

  getFullRideInfo(content: any, index: number) {
    this.modalRef = this._modalService.open(content, { size: 'lg', centered: true, scrollable: true });
    this.fullRideData = [this.rideDataList[index]];
    this.modalRef.shown.subscribe({
      next: () => {
        this.initMap();
      }
    })
  }

  initMap(latitude:number = 22.270956722802083, longitude: number = 70.7387507402433, zoomSize:number = 12) {
    let location:any = {lat: Number(latitude), lng: Number(longitude)};
    
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: location,
      zoom: zoomSize
    });
    this.directionsRenderer.setMap(this.map);
    this.showDirection();
  }

  showDirection() {

    this.wayPts = [];
    /**Push all the intermediate stops into the array */
    for (let i = 0; i < this.fullRideData[0].rideIntermediateStops.length; i++) {
      this.wayPts.push({
        location: this.fullRideData[0].rideIntermediateStops[i],
        stopover: true
      })
    }

    this.directionsService.route({
      origin: this.fullRideData[0].ridePickUpLocation,
      destination: this.fullRideData[0].rideDropLocation,
      waypoints: this.wayPts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    },((response: any, status: any) => {
        // this.directionsRenderer.setDirections(response);
        if (status == google.maps.DirectionsStatus.OK) {
          
          /**Get the polyline data from the response */
          let drawPolyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(response.routes[0].overview_polyline),
            geodesic: true,
            strokeColor: "#73B9FF",
            strokeOpacity: 1.0,
            strokeWeight: 5
          });

          /**Set the map for polyline and also create an empty marker array */
          drawPolyline.setMap(this.map);
          let markers: any[] = [];
          let currentMarkerAsciiCode = 66;

          /**Marker for starting point */
          let pickupMarker = new google.maps.Marker({
            position: response.routes[0].legs[0].start_location,
            map: this.map,
            label: {
              text: 'A',
              color: 'white'
            }
          });
          markers.push(pickupMarker)

          /**Loop for all the intermediate stops and also pushing them to markers array */
          for (let i = 1; i <= this.fullRideData[0].rideIntermediateStops.length; i++) {
            let marker = new google.maps.Marker({
              position: response.routes[0].legs[i].start_location,
              map: this.map,
              label: {
                text: String.fromCharCode(currentMarkerAsciiCode),
                color: "white"
              }
            })
            currentMarkerAsciiCode += 1;
            markers.push(marker);
          }

          /**Maeker for ending point and also make the path as center and map according to its bound points*/
          let destinationMarker = new google.maps.Marker({
            position: response.routes[0].legs[response.routes[0].legs.length - 1].end_location,
            map: this.map,
            label: {
              text: String.fromCharCode(currentMarkerAsciiCode),
              color: "white"
            }
          })
          markers.push(destinationMarker)
          this.map.fitBounds(response.routes[0]?.bounds);
          this.map.setCenter(response.routes[0]?.bounds.getCenter());
        }
      }
    ));
  }

  searchRide() {
    const rideFilterData = {
      rideSearchData: this.rideFilter.get('rideSearchData').value || "null",
      rideStatus: this.rideFilter.get('rideStatus').value || "null",
      rideVehicleType: this.rideFilter.get('rideVehicleType').value || "null",
      rideFromDate: this.rideFilter.get('rideFromDate').value || "null",
      rideToDate: this.rideFilter.get('rideToDate').value || "null"
    }
    this._rideService.getRideData([0,7],rideFilterData, 0).subscribe({
      next: (response) => {
        if (response.ride.length == 0) {
          return this._toastrService.error("No ride to display");
        }
        this.totalRecordLength = response.totalRecord ? response.totalRecord : response.ride.length;
        this.rideDataList = response.ride;
        this.p = 1;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting data");
        console.log(error);
      },
      complete: () => {}
    })
  }

  downloadData() {
    const rideFilterData = {
      rideSearchData: this.rideFilter.get('rideSearchData').value || "null",
      rideStatus: this.rideFilter.get('rideStatus').value || "null",
      rideVehicleType: this.rideFilter.get('rideVehicleType').value || "null",
      rideFromDate: this.rideFilter.get('rideFromDate').value || "null",
      rideToDate: this.rideFilter.get('rideToDate').value || "null"
    }
    this._rideService.getRideData(null, rideFilterData).subscribe({
      next: (response) => {
        if (response.ride.length <= 0) {
          return this._toastrService.info("Currently there are no rides to download", "");
        }

        const stringifiedArray = response.ride.map((item: any) => {
          for (const key in item) {
            if (typeof item[key] === 'object') {
              item[key] = JSON.stringify(item[key]);
            }
          }
          return item;
        });
        const csv = Papa.unparse(stringifiedArray);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'tableData.csv');
      }
    })
  }
}
