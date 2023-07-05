import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private _authService: AuthService,
    private _toastrService: ToastrService
    ) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
  }
  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return 'Dashboard';
  }

  onLogout() {
    this._authService.logOutAdmin().subscribe({
      next: (response) => {
        localStorage.clear();
        this.router.navigate(['login']);
        this._toastrService.success(response.msg, "Logout successfull");
      },
      error: (error) => {
        this._toastrService.error(error.error.error);
      },
      complete: () => {}
    })

  }

  onLogoutAllDevice() {
    this._authService.logOutAdminAllDevice().subscribe({
      next: (response) => {
        localStorage.clear();
        this.router.navigate(['login']);
        this._toastrService.success(response.msg, "Logout successfull");
      },
      error: (error) => {
        this._toastrService.error(error.error.error);
      },
      complete: () => {}
    })
  }

}
