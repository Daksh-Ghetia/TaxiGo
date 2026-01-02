import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { VehicleTypeService } from 'src/app/shared/vehicle-type.service';
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-vehicle-type',
  templateUrl: './vehicle-type.component.html',
  styleUrls: ['./vehicle-type.component.scss']
})
export class VehicleTypeComponent implements OnInit {

  constructor(
    private _vehicleTypeService: VehicleTypeService,
    private _toastrService: ToastrService
  ) { }

  title: string = "Add";
  reactiveForm: FormGroup;
  vehicles: any = [];
  customErrMsg: string;
  updateId: string;
  apiBaseUrl: string = environment.apiBaseUrl;

  ngOnInit(): void {
    this.getVehicleType()

    this.reactiveForm = new FormGroup({
       vehicleName: new FormControl(null, [Validators.required]),
       vehicleIcon: new FormControl(null, [Validators.required] ),
    });
  }

  /**Get the details of all the vehicles */
  getVehicleType() {
    /**Call the service and subscribe to the data change */
    this._vehicleTypeService.getVehicleType().subscribe({
      next: (response) => {
        if (response.vehicle.legth == 0) {
          return this._toastrService.info("No vehicle type to display")
        }
        this.vehicles = response.vehicle;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting data");
      }
    })
  }

  /**Delete the vehicle type*/
  deleteVehicleType(id: string) {
    /**Call the service for deleting the vehicle type */
    this._vehicleTypeService.deleteVehicleType(id).subscribe(
      (response) => {
      this.getVehicleType();
    })
  }

  addVehicleType() {
    let buttonVal = document.getElementById('submit').textContent

    if (buttonVal === "Edit Vehicle Type") {
      return this.editVehicleType();
    }

    if (this.reactiveForm.invalid === true) {
      this.reactiveForm.get('vehicleName').markAsDirty();
      this.reactiveForm.get('vehicleIcon').markAsTouched();
      this._toastrService.warning("Please enter valid details", "Invalid details");
      return console.log("Invalid form details");
    }

    const vehicleAddForm = document.getElementById('addNewVehicleType') as HTMLFormElement;
    const formData = new FormData(vehicleAddForm);

    this._vehicleTypeService.addVehicleType(formData).subscribe({
      next: () => {
        this.getVehicleType();
        this.cancelAction();
        this._toastrService.success("New vehicle type added successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while adding vehicle type");
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    });
  }

  editVehicleType() {
    if (this.updateId === "" || this.reactiveForm.get('vehicleName').value == "") {
      this._toastrService.warning("Please enter valid details", "Invalid details");
      return console.log("invalidUpdata");
    }

    const vehicleAddForm = document.getElementById('addNewVehicleType') as HTMLFormElement;
    const formData = new FormData(vehicleAddForm);
    this._vehicleTypeService.editVehicleType(this.updateId, formData).subscribe({
      next: (response) => {
        this.getVehicleType();
        this.cancelAction();
        this._toastrService.success("Vehicle type added successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while updating vehicle type");
      },
      complete: () => {}
    })
  }

  editDetails (id: string, name: string) {
    this.title = "Edit";
    this.reactiveForm.get('vehicleName').setValue(name);
    this.updateId = id;
  }

  cancelAction() {
    this.title = "Add";
    this.reactiveForm.reset();
    this.reactiveForm.get('vehicleName').markAsPristine();
    this.reactiveForm.get('vehicleIcon').markAsUntouched();
    this.updateId = "";
    this.customErrMsg = "";
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
