import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';


declare var google: any
@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {

  public countryList: any = [];
  public createdPolygonList: any = [];
  public cityList: any = []
  public reactiveForm: FormGroup;
  private map: google.maps.Map;
  private marker: google.maps.Marker;
  private autocomplete: google.maps.places.Autocomplete;
  public customErrMsg: string;
  private editablePolygon: google.maps.Polygon;
  private infoWindow = new google.maps.InfoWindow();
  public polygon: google.maps.Polygon;

  private originalPaths: google.maps.MVCArray<google.maps.LatLng>;

  constructor(private _countryService: CountryService, private _cityService: CityService) { }

  ngOnInit(): void {
    this.fillCountryDropDown();
    this.initMap();
    this.getCity();

    this.reactiveForm = new FormGroup({
      countryId: new FormControl(null, [Validators.required]),
      cityName: new FormControl(null, [Validators.required]),
      cityLatLng: new FormControl(null, [])
    });
  }

  fillCountryDropDown() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        this.countryList = response.country;
      },
      error: (error) => {

      },
      complete: () => {}
    })
  }

  initMap(latitude:number = 22.270956722802083, longitude: number = 70.7387507402433, zoomSize:number = 8) {

    let location:any = {lat: Number(latitude), lng: Number(longitude)};
      
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: location,
      zoom: zoomSize
    });

    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
    })
    this.marker.setPosition(null);

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,      
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON
        ],
      },
    })

    drawingManager.setMap(this.map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {

      if (this.polygon) {
        this.polygon.setMap(null);
      }

      if (event.type == google.maps.drawing.OverlayType.POLYGON) {
        this.polygon = event.overlay as google.maps.Polygon;
        
        this.polygon.setOptions({
            editable: true
        });
      }
    });

    this.initAutoComplete()
  }

  getCity() {
    this._cityService.getCityList().subscribe({
      next: (response) => {
        
        this.cityList = response.city;
        for (let index = 0; index < this.createdPolygonList.length; index++) {
          const element = this.createdPolygonList[index];
          element.setMap(null);
        }

        for (let index = 0; index < this.cityList.length; index++) {
          const city = this.cityList[index];
          this.createPolygon(city);
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  addCity() {
    /**If the form is invalid or without the polygon drawn display errors */
    if (this.reactiveForm.invalid === true || !this.polygon) {
      
      this.reactiveForm.markAllAsTouched()
      if (this.polygon && this.polygon.getPath() && this.polygon.getPath().getArray().length >= 3) {
        this.reactiveForm.get('cityLatLng').markAsUntouched();
      }
      return
    }
    
    const addCityData = {
      'countryId': this.reactiveForm.get('countryId').value,
      'cityName': (document.getElementById('cityName')as HTMLInputElement).value,
      'cityLatLng': this.polygon.getPath().getArray()
    }

    this._cityService.addCity(addCityData).subscribe({
      next: (response) => {
        this.polygon.setMap(null);
        this.getCity();
        this.resetMap();
      },
      error: (error) => {
        console.log(error);        
      }
    })
  }

  resetMap() {    
    this.customErrMsg = "";
    this.reactiveForm.reset();
    this.infoWindow.close();
    if (this.editablePolygon) {
      this.editablePolygon.setEditable(false)
      this.editablePolygon = null;      
    }
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
  }

  createPolygon(city: any) {
    /**Create a new polygon and display it in map */    
    const poly = new google.maps.Polygon({
      paths: city.cityLatLng,
    })
    poly.setMap(this.map);
    this.createdPolygonList.push(poly);

    /**Add listener that exexutes every time a map is clicked */
    google.maps.event.addListener(poly, "click", (event) => {

      /**Check if the click is on currently editing polygon */
      if (this.editablePolygon && this.editablePolygon != poly) {
        this.editablePolygon.setEditable(false);
      }      

      /**When user click on the map
       * if the map is inside the polygon then execute the following sequence
       * else set the polygon as noneditable and also close any open infoWindow
       */
      if (google.maps.geometry.poly.containsLocation(event.latLng, poly)) {
        /**Make the polygon editable and set editable polygon value to current polygon*/
        poly.setEditable(true);
        this.editablePolygon = poly;

        /**get the bounds of curent polygon and get the center point   */
        const bounds = new google.maps.LatLngBounds();
        city.cityLatLng.forEach((point) => bounds.extend(point));
        const center = bounds.getCenter();

        /**Set the content of the infowindow that should be displayed */        
        const content = `
          <div class="info-window-content">
            <label for="countryName" class="info-window-label">Country Name <span class="info-window-colon">:</span></label>
            <input type="text" class="infoCity-Input" name="countryName" id="countryEdit" value=${city.country[0].countryName} placeholder="Country Name" disabled>
            <br>

            <label for="cityNameEdit" class="info-window-label">City Name <span class="info-window-colon">:</span></label>
            <input type="text" class="infoCity-Input" name="cityNameEdit" value=${city.cityName} id="cityNameEdit" placeholder="City name">
            <br>
            <input type="text" class="infoCity-Input" name="cityId" id="cityId" value=${city._id} hidden>
            <br>

            <button class="btn btn-success editButton" id="editCity">Update City</button>
            <button class="btn btn-danger editButton" id="cancelCity">Delete City</button>
          </div>
        `;

        /**Css for infowindow */
        const infoWindowStyle = `
        .info-window-content {
          
          padding: 5px;
        }
        
        .info-window-label {
          font-size: 16px;
          margin-right: 10px;
        }
        
        .info-window-colon {
          font-weight: bold;
        }
        
        .infoCity-Input {
          margin-bottom: 10px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
          box-sizing: border-box;
        }
        
        .editButton {
          margin-top: 10px;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        
        .btn-success {
          color: #fff;
          background-color: #28a745;
          border-color: #28a745;
        }
        
        .btn-success:hover {
          background-color: #218838;
          border-color: #1e7e34;
        }
        
        .btn-danger {
          color: #fff;
          background-color: #dc3545;
          border-color: #dc3545;
        }
        
        .btn-danger:hover {
          background-color: #c82333;
          border-color: #bd2130;
        }
        `

        /**Set the content and position of info window and open in the infoWindow in map along with the css*/
        this.infoWindow.setContent(content);
        this.infoWindow.setPosition(center);
        this.infoWindow.open(this.map);
        this.infoWindow.addListener('domready', () => {
          (document.getElementById('cityNameEdit') as HTMLInputElement).value = city.cityName
          const infoWindowContainer = document.querySelector('.gm-style-iw');
          const infoWindowStyleNode = document.createElement('style');
          infoWindowStyleNode.innerHTML = infoWindowStyle;
          infoWindowContainer.parentNode.insertBefore(infoWindowStyleNode, infoWindowContainer);
        });

        /**Add Edit and delete property with the buttons after they are loaded in DOM*/
        setTimeout(() => {

          /**Delete */
          document.getElementById("cancelCity").addEventListener("click", () => {
            let cityId =  (document.getElementById('cityId') as HTMLInputElement).value;
            this._cityService.deleteCity(cityId).subscribe({
              next: (response) => {
                this.resetMap();
                this.getCity();
              }
            })
            this.resetMap();
          });

          this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('cityNameEdit') as HTMLInputElement, {
            types: ['(cities)']
          })
          
          document.getElementById('editCity').addEventListener("click", () => {
            let cityId =  (document.getElementById('cityId') as HTMLInputElement).value;

            const editCityData = {
              'cityName': (document.getElementById('cityNameEdit') as HTMLInputElement).value,
              'cityLatLng': this.editablePolygon.getPath().getArray()
            }

            this._cityService.editCity(cityId, editCityData).subscribe({
              next: (response) => {
                this.getCity();
                this.resetMap();
              },
              error: (error) => {
                console.log(error);
              },
              complete: () => {}
            })
            
          })
        }, 100);

        /**Close the info Window whenever clicked outside the polygon and also make the polygon non editable*/
        google.maps.event.addListener(this.map, "click", (event) => {
          if (!google.maps.geometry.poly.containsLocation(event.latLng, poly)) {
            if (this.editablePolygon) {
              this.editablePolygon.setEditable(false);
              this.editablePolygon = null;              
            }
            this.infoWindow.close();
          }
        });

      } else {
        poly.setEditable(false);
        this.editablePolygon = null;
        this.originalPaths = null;
        this.infoWindow.close();
      }
    })

    setTimeout(() => {
      document.getElementById(city.cityName).addEventListener("click",() => {
        const location = new google.maps.LatLng(city.cityLatLng[0].lat, city.cityLatLng[0].lng);
        const event = {
          latLng: location,
          stop: () => {}
        } as google.maps.MapMouseEvent;
        google.maps.event.trigger(poly, 'click', event);
      })      
    }, 1000);

  }

  initAutoComplete(){
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('cityName') as HTMLInputElement, {
      types: ['(cities)']
    })
  }
}