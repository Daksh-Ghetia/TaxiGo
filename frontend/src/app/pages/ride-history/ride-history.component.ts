import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RideService } from 'src/app/shared/ride.service';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.component.html',
  styleUrls: ['./ride-history.component.scss']
})
export class RideHistoryComponent implements OnInit {

  constructor(
    private _rideService: RideService,
    private _toastrService: ToastrService,
    private _modalService: NgbModal
  ) { }

  public rideDataList: any = [];
  public fullRideData: any = [];

  private modalRef: NgbModalRef;

  /**Map variables */
  private map: google.maps.Map;
  private directionsService = new google.maps.DirectionsService();
  private directionsRenderer = new google.maps.DirectionsRenderer();
  private wayPts: google.maps.DirectionsWaypoint[] = [];

  ngOnInit(): void {
    this.getRideData();
  }

  getRideData() {
    this._rideService.getRideData().subscribe({
      next: (response) => {
        if (response.ride.length <= 0) {
          return this._toastrService.info("Currently there are no rides to display", "")
        }
        this.rideDataList = response.ride;
      },
      error: (error) => {
        console.log(error);
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
      
    console.log(this.fullRideData);
    
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
    })
    .then((response) => {
      console.log(response);
      this.directionsRenderer.setDirections(response)
    })
    .catch((error) => {
      this.directionsRenderer.setDirections({routes: []});
    });
  }
}
