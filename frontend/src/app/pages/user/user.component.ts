import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/shared/country.service';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public userForm: FormGroup;
  public countryList: any = [];
  public userDataList: any = [];
  public customErrMsg: string = '';
  public selectedCountryCode: string = '';
  public actionButton: string = 'Add';
  public sideButtonTitle: string = "Add"
  public focus : any;

  /**For sorting data */
  private sortedColumn: string = '';
  public currentSort: string = "";
  public currentSortDirection: string = '';
  private isAscending: boolean = true;

  constructor(
    private _countryService: CountryService,
    private _userService: UserService,
    private _toaster: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getUserData();
    this.fillCountryDropDown();

    this.userForm = new FormGroup({
      userName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z]+([ ][a-zA-Z]+)*$/)]),
      userEmail: new FormControl(null, [Validators.required, Validators.email]),
      userPhone: new FormControl(null, [Validators.required, Validators.pattern(/^\d{10}$/)]),
      userCountryId: new FormControl(null, [Validators.required]),
      userCountryCode: new FormControl(null, []),
      userProfile: new FormControl(null, []),
      userSearch: new FormControl(null, [])
    })
  }

  fillCountryDropDown() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        this.countryList = response.country;
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  setSelectedCountry(countryName: string) {
    const selectedCountry = this.countryList.find(country => country._id === countryName);    
    if (selectedCountry) {
      this.selectedCountryCode = selectedCountry.countryCode;
    }
  }

  getUserData() {
    this._userService.getUserData().subscribe({
      next: (response) => {        
        if (response.user.length > 0) {
          this.userDataList = response.user;
        } else {
          return this._toaster.info("No user found to display, please add new user to view data", "User not found");
        }
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  addUser() {
    if (this.userForm.invalid == true) {
      this.userForm.markAllAsTouched();
      return
    }

    const userForm = (document.getElementById('user') as HTMLFormElement)
    const userFormData = new FormData(userForm) ;

    if (this.actionButton == "Edit") {
      return this.editUser(userFormData);
    }    

    this._userService.addNewUser(userFormData).subscribe({
      next: (response) => {
        this.getUserData();
        this.cancelUser();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
      },
      complete: () => {}
    })
  }

  cancelUser() {
    this.userForm.reset();
    this.customErrMsg = "";
    this.actionButton = "Add";
    this.getUserData();
  }

  fillDataForEdit(data: any) {
    this.sideButtonTitle = "Search";
    this.actionButton = "Edit";

    setTimeout(() => {
      this.selectedCountryCode = data.driverCountryCode;
      this.userForm.patchValue({
        'userName': data.userName,
        'userEmail': data.userEmail,
        'userPhone': data.userPhone,
        'userCountryId': data.userCountryId
      });
      this.setSelectedCountry(data.userCountryId);
      (document.getElementById('editUserId') as HTMLElement).textContent = data._id;
    }, 100);
    
  }

  editUser(editFormData: any) {
    const id = (document.getElementById('editUserId') as HTMLElement).textContent;
    this._userService.editUser(id, editFormData).subscribe({
      next: (response) => {
        this.getUserData();
        this.cancelUser();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
        console.log(error);        
      },
      complete: () => {}
    })
  }

  deleteUser(id: string) {
    let choice  = confirm('are you sure you want to delete user')

    if (choice == false) {
      return;
    }
    
    this._userService.deleteUser(id).subscribe({
      next: (response) => {
        this.getUserData();
        this.cancelUser();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
        console.log(error);        
      },
      complete: () => {}
    })
  }

  searchUser() {
    if (this.userForm.get('userSearch').value == null || this.userForm.get('userSearch').value == '') {
      return this.customErrMsg = 'Please enter a value to search'
    }   
    
    const data = this.userForm.get('userSearch').value;
    this._userService.getUserData(data).subscribe({
      next: (response) => {
        if (response.user.length > 0) {
          this.userDataList = response.user;
        } else {
          this.userDataList = [];
          return this._toaster.info("No user found to display, please add new user to view data", "User not found");
        }
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  sortData(columnName: string) {
    if (this.sortedColumn === columnName) {
      if (this.currentSortDirection == "asc") {
        this.isAscending = !this.isAscending; // Reverse the order if the same column is clicked again
        this.currentSortDirection = "desc";        
      } else {
        this.isAscending = !this.isAscending;
        this.currentSortDirection = "asc"
      }
    } else {
      this.isAscending = true; // Set the default order to ascending
      this.sortedColumn = columnName; // Update the sorted column
      this.currentSort = columnName;
      this.currentSortDirection = "asc";
    }

    // Sort the data based on the selected column and order
    this.userDataList.sort((a, b) => {
      if (this.isAscending) {
        return (a[columnName] > b[columnName]) ? 1 : -1;
      } else {
        return (a[columnName] < b[columnName]) ? 1 : -1;
      }
    });
  }

  sideButton() {
    if (this.sideButtonTitle === "Add") {
      this.sideButtonTitle = "Search";
    } else {
      this.sideButtonTitle = "Add";
    }
    this.customErrMsg = "";
    this.getUserData();
    this.cancelUser();
  }
}
