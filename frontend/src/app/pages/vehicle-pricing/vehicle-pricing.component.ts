import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
    private _toastrService: ToastrService
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
  public p: any = 1;
  public totalRecordLength: number;

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
        if (response.country.length == 0) {
          return this._toastrService.info("No country to display, please add new country to display");
        }
        this.countryList = response.country;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting country list");
      },
      complete: () => {}
    })
  }

  fillCityDropDown(countryId: string) {
    this._cityService.getCityList(countryId).subscribe({
      next: (response) => {
        if (response.city.length == 0) {
          this.cityList = [];
          return this._toastrService.info("No city to display, please add new city to display");
        }
        this.cityList = response.city;
      },
      error: (error) => {
        this.cityList = [];
        this._toastrService.error("Error occured while getting city data");
      },
      complete: () => {}
    })
  }

  fillVehicleTypeDropDown() {
    this._vehicleTypeService.getVehicleType().subscribe({
      next: (response) => {
        if (response.vehicle.length == 0) {
          return this._toastrService.info("No vehicle type to display, please add new vehicle type to display");
        }
        this.vehicleTypeList = response.vehicle;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg ||"Error occured while getting vehicle type");
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
        this._toastrService.success("Vehicle pricing added successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while adding vehicle pricing");
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
        this._toastrService.success("Vehicle pricing edited successfully.");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while updateing vehicle pricing");
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
    this._vehiclePricingService.getVehiclePricing("", this.p-1).subscribe({
      next: (response) => {
        if (response.vehiclePricing.length == 0) {
          return this._toastrService.info("No vehicle pricing found");
        }
        this.totalRecordLength = response.totalRecord;
        this.vehiclePricingList = response.vehiclePricing;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting vehicle pricing list.");
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
    if (confirm('are you sure you want to delete vehicle pricing')) {
      this._vehiclePricingService.deleteVehiclePricing(id).subscribe({
        next: (response) => {
          this.getVehiclePricing();
          this._toastrService.success("Vehicle pricing deleted successfully");
        },
        error: (error) => {
          this._toastrService.error(error.error.msg || "Error occured while deleting vehicle pricing");
        },
        complete: () => {}
      })
    }
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

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
