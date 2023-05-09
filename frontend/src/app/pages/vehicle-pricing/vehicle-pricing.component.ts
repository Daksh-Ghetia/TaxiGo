import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';
import { VehiclePricingService } from 'src/app/shared/vehicle-pricing.service';
import { VehicleTypeService } from 'src/app/shared/vehicle-type.service';

@Component({
  selector: 'app-vehicle-pricing',
  templateUrl: './vehicle-pricing.component.html',
  styleUrls: ['./vehicle-pricing.component.scss']
})
export class VehiclePricingComponent implements OnInit {

  constructor(
    private _countryService: CountryService,
    private _cityService: CityService,
    private _vehicleTypeService: VehicleTypeService,
    private _vehiclePricingService: VehiclePricingService,
  ) { }

  public vehiclePricingForm: FormGroup;
  public countryList: any = [];
  public cityList: any = [];
  public vehicleTypeList: any = [];
  public vehiclePricingList: any = [];
  public customErrMsg: string;
  public actionButton: string = "Add";
  private sortedColumn: string = '';
  public currentSort: string = "";
  public currentSortDirection: string = '';
  private isAscending: boolean = true;

  ngOnInit(): void {
    this.fillCountryDropDown();
    this.fillVehicleTypeDropDown();
    this.getVehiclePricing();

    this.vehiclePricingForm = new FormGroup({
      countryId: new FormControl(null, [Validators.required]),
      cityId: new FormControl(null, [Validators.required]),
      vehicleTypeId: new FormControl(null, [Validators.required]),
      driverProfit: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]),
      minimumFare: new FormControl(null, [Validators.required, Validators.min(0)]),
      distanceForBasePrice: new FormControl(null, [Validators.required, Validators.min(0)]),
      basePrice: new FormControl(null, [Validators.required, Validators.min(0)]),
      pricePerUnitDistance: new FormControl(null, [Validators.required, Validators.min(0)]),
      pricePerUnitTime: new FormControl(null, [Validators.required, Validators.min(0)]),
      maxSpace: new FormControl(null, [Validators.required, Validators.min(0)])
    })
  }

  fillCountryDropDown() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        this.countryList = response.country;
      },
      error: (error) => {
        this.countryList = [{countryName: "No country To display", countryIcon: ""}];
      },
      complete: () => {}
    })
  }

  fillCityDropDown(countryId: string) {
    this._cityService.getCityList(countryId).subscribe({
      next: (response) => {
        this.cityList = response.city;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  fillVehicleTypeDropDown() {
    this._vehicleTypeService.getVehicleType().subscribe({
      next: (response) => {
        this.vehicleTypeList = response.vehicle;
      },
      error: (error) => {

      },
      complete: () => {}
    })
  }

  addVehiclePricing(){
    if (this.vehiclePricingForm.invalid == true) {
      this.vehiclePricingForm.markAllAsTouched();
      return
    }

    if (this.actionButton === "Edit") {
      return this.editVehiclePricing();
    }

    const addVehiclePricingData = document.getElementById('vehiclePricing') as HTMLFormElement;
    const formData = new FormData(addVehiclePricingData);

    this._vehiclePricingService.addVehiclePricing(formData).subscribe({
      next: (response) => {
        this.getVehiclePricing();
        this.cancelVehiclePricing();
      },
      error: (error) => {
        console.log(error);
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })
  }

  editVehiclePricing() {
    const id = (document.getElementById('editId') as HTMLElement).textContent;
    const formData = new FormData(document.getElementById('vehiclePricing') as HTMLFormElement);

    formData.delete('countryId');
    formData.delete('cityId');
    formData.delete('vehicleTypeId');

    this._vehiclePricingService.editVehiclePricing(id, formData).subscribe({
      next: (response) => {
        this.cancelVehiclePricing();
        this.getVehiclePricing();
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })

  }

  cancelVehiclePricing() {
    this.vehiclePricingForm.reset();
    this.vehiclePricingForm.enable();
    this.cityList = [];
    this.customErrMsg = "";
    this.actionButton = "Add";
    (document.getElementById('editId') as HTMLElement).textContent = "";
  }

  getVehiclePricing() {
    this._vehiclePricingService.getVehiclePricing().subscribe({
      next: (response) => {
        this.vehiclePricingList = response.vehiclePricing;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  fillDataForEdit(data: any) {
    this.vehiclePricingForm.get('countryId').setValue(data.country._id);
    this.vehiclePricingForm.get('countryId').disable();

    this.cityList = [{cityName: data.city.cityName, _id: data.city._id}];
    this.vehiclePricingForm.get('cityId').setValue(data.city._id);
    this.vehiclePricingForm.get('cityId').disable();

    this.vehiclePricingForm.get('vehicleTypeId').setValue(data.vehicleType._id);
    this.vehiclePricingForm.get('vehicleTypeId').disable();

    this.vehiclePricingForm.get('driverProfit').setValue(data.driverProfit);
    this.vehiclePricingForm.get('minimumFare').setValue(data.minimumFare);
    this.vehiclePricingForm.get('distanceForBasePrice').setValue(data.distanceForBasePrice);
    this.vehiclePricingForm.get('basePrice').setValue(data.basePrice);
    this.vehiclePricingForm.get('pricePerUnitDistance').setValue(data.pricePerUnitDistance);
    this.vehiclePricingForm.get('pricePerUnitTime').setValue(data.pricePerUnitTime);
    this.vehiclePricingForm.get('maxSpace').setValue(data.maxSpace);

    this.actionButton = "Edit";
    (document.getElementById('editId') as HTMLElement).textContent = data._id;
  }

  deleteVehiclePricing(id: string) {
    this._vehiclePricingService.deleteVehiclePricing(id).subscribe({
      next: (response) => {
        this.getVehiclePricing();
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  sortData(columnName: string) {
    if (this.sortedColumn === columnName) {
      this.isAscending = !this.isAscending; // Reverse the order if the same column is clicked again
      this.currentSortDirection = "desc";
    } else {
      this.isAscending = true; // Set the default order to ascending
      this.sortedColumn = columnName; // Update the sorted column
      this.currentSort = columnName;
      this.currentSortDirection = "asc";
    }

    // Sort the data based on the selected column and order
    this.vehiclePricingList.sort((a, b) => {
      if (this.isAscending) {
        return (a[columnName] > b[columnName]) ? 1 : -1;
      } else {
        return (a[columnName] < b[columnName]) ? 1 : -1;
      }
    });
  }
}
