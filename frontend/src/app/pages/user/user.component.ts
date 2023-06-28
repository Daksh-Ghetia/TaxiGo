import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/shared/country.service';
import { UserService } from 'src/app/shared/user.service';
import { loadStripe } from '@stripe/stripe-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public userForm: FormGroup;
  public countryList: any = [];
  public userDataList: any = [];
  public cardDetails: any = [];
  public customerDetails: any;
  public customErrMsg: string = '';
  public selectedCountryCode: string = '';
  public actionButton: string = 'Add';
  public sideButtonTitle: string = "Add"
  public focus : any;
  public Stripe: any;
  public selectedCardId: string;
  public p: any = 1;
  public totalRecordLength: number;
  
  private options: any;
  private elements: any;
  private paymentElement: any;
  private userId: any;

  /**For sorting data */
  private sortedColumn: string = '';
  public currentSort: string = "";
  public currentSortDirection: string = '';
  private isAscending: boolean = true;

  constructor(
    private _countryService: CountryService,
    private _userService: UserService,
    private _toastrService: ToastrService,
    private _modalService: NgbModal,
  ) { }

  async ngOnInit() {
    this.fillCountryDropDown();
    await this.loadStripe();

    this.userForm = new FormGroup({
      userName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z]+([ ][a-zA-Z]+)*$/)]),
      userEmail: new FormControl(null, [Validators.required, Validators.email]),
      userPhone: new FormControl(null, [Validators.required, Validators.pattern(/^\d{10}$/)]),
      userCountryId: new FormControl(null, [Validators.required]),
      userCountryCode: new FormControl(null, []),
      userProfile: new FormControl(null, []),
      userSearch: new FormControl("", [])
    })
  }

  ngAfterViewInit() {
    this.getUserData();
  }

  fillCountryDropDown() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        if (response.country.length == 0) {
          return this._toastrService.warning("Please add new countries to display","No countries to display");
        }
        this.countryList = response.country;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting country data")
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
    let data: string = "";
    if (this.sideButtonTitle == "Add") {
      setTimeout(() => {
        data = (document.getElementById('searchUser') as HTMLInputElement).value;
      }, 10);
    }
    this._userService.getUserData(data, this.p-1).subscribe({
      next: (response) => {
        if (response.user.length == 0) {
          return this._toastrService.info("No user found to display, please add new user to use data", "User not found");
        }
        this.userDataList = response.user;
        this.totalRecordLength = response.totalRecord;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting user data");
        console.log(error);
      },
      complete: () => {}
    })
  }

  addUser() {
    if (this.userForm.invalid == true) {
      this.userForm.markAllAsTouched();
      return this._toastrService.warning("Invalid details to add user", "");
    }

    const userForm = (document.getElementById('user') as HTMLFormElement);
    const userFormData = new FormData(userForm);

    if (this.actionButton == "Edit") {
      return this.editUser(userFormData);
    }

    this._userService.addNewUser(userFormData).subscribe({
      next: (response) => {
        this.getUserData();
        this.cancelUser();
        this._toastrService.success("User added successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while adding new user");
        this.customErrMsg = error.error.msg;
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
    
    this.sideButtonTitle = "Search";
    this.actionButton = "Edit";
  }

  editUser(editFormData: any) {
    const id = (document.getElementById('editUserId') as HTMLElement).textContent;
    this._userService.editUser(id, editFormData).subscribe({
      next: (response) => {
        this.getUserData();
        this.cancelUser();
        this._toastrService.success("User updated sucessfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while updating user");
        this.customErrMsg = error.error.msg;
        console.log(error);        
      },
      complete: () => {}
    })
  }

  deleteUser(id: string) {
    if (confirm('are you sure you want to delete user')) {
      this._userService.deleteUser(id).subscribe({
        next: (response) => {
          this.getUserData();
          this.cancelUser();
          this._toastrService.success("User deleted successfully");
        },
        error: (error) => {
          this._toastrService.error(error.error.msg || "Error occured while deleting user");
          this.customErrMsg = error.error.msg;
        },
        complete: () => {}
      })
    }
  }

  searchUser() {
    if (this.userForm.get('userSearch').value == null || this.userForm.get('userSearch').value == '') {
      return this.customErrMsg = 'Please enter a value to search'
    }   
    
    const data = this.userForm.get('userSearch').value;
    this._userService.getUserData(data).subscribe({
      next: (response) => {
        if (response.user.length == 0) {
          this.userDataList = [];
          return this._toastrService.info("No user found to display, please add new user to view data", "User not found");
        }
        this.userDataList = response.user;
        this.totalRecordLength = response.totalRecord;
        this.p = 1
        this._toastrService.success("Data found successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while searching for data");
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

  cardsInfo(content: any, currentCustomerId: string) {
    this._modalService.open(content, { scrollable:true, centered: true });
    this.userId = currentCustomerId;
    this.options = {
      mode: 'setup',
      currency: 'usd',
      appearance: {}
    };

    this.elements = this.Stripe.elements(this.options);
    this.paymentElement = this.elements.create('payment',  {
      layout: {
        type: 'accordion',
        defaultCollapsed: false,
        radios: true,
        spacedAccordionItems: false
      }
    });
    this.paymentElement.mount('#payment-element');
  }

  /**Add payment methods */
  async addPaymentDetails() {
    const {error: submitError} = await this.elements.submit();

    if (submitError) {
      return;
    }

    this._userService.addPaymentDetails(this.userId).subscribe({
      next: async (response) => {

        /**Confirm the setup in the stripe */
        const {error} = await this.Stripe.confirmSetup(
          {
            elements: this.elements,
            clientSecret: response.clientSecret,
            confirmParams: {
              return_url: 'http://localhost:4200/#/users',
            },
          }
        );
    
        /**If the error occured while confirming setup then display error */
        if (error) {
          this._toastrService.error("Error occured while adding card", "Error occured");
        } else {
          this._toastrService.success("Card added successfully", "Card Added");
        }
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  /**Get all the cards of the user */
  async getCardDetails(customerId: string) {
    this._userService.getCardDetails(customerId).subscribe({
      next: (response) => {
        if (response.cardsData.length != 0) {
          this.customerDetails = response.customerData;
          this.cardDetails = response.cardsData;
        } else this.cardDetails = [];
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting cards list")
        console.log(error);
      },
      complete: () => {}
    })
  }

  /**Set default card to user */
  async setDefaultCard() {
    this._userService.setDefaultCard(this.customerDetails.id, this.selectedCardId).subscribe({
      next: () => {
        this._toastrService.success("Your default card payment has been updated successfully","Card Updated")
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error("Error occured while updating default card","Card Updated failed");
      },
      complete: () => {}
    })
  }

  /**Delete already added card */
  async deleteCard(cardId: string) {
    if (confirm('Are you sure you want to delete card details')) {
      this._userService.deleteCard(cardId).subscribe({
        next: (response) => {
          this.getCardDetails(this.customerDetails.id);
          this._toastrService.success("Your card has been deleted successfully", "Card deleted");
        },
        error: (error) => {
          this._toastrService.error("Error occured while deleting card", "Error");
        },
        complete: () => {}
      })
    }
  }

  /**Change selected card */
  selectCard(cardId: string) {
    this.selectedCardId = cardId;
  }

  async loadStripe() {
    this.Stripe = await loadStripe('pk_test_51NBdBuEF3TbQVrFuugu1BAMWKX2oAVuoC5bpR0io2v4gVjcknbVI6zFqHCYhwDVuWSSxuTxrBldguWrZuVXns8oz00M1WV7P5h');
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
