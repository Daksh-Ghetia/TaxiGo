import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;

  constructor(
    private _authService: AuthService,
    private router: Router,
    private _toastrService: ToastrService
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      pass: new FormControl(null, [Validators.required])
    })
  }
  ngOnDestroy() {
  }

  Authenticate() {
    
    let email = (document.getElementById('email') as HTMLInputElement).value;
    let pass = (document.getElementById('password') as HTMLInputElement).value;

    if (email == "" || pass == "") {
      return this._toastrService.error("Please enter all the necessary details","");
    }
    
    let data: any = {email: email, password: pass};

    this._authService.authenticateAdmin(data).subscribe({
      next: (response) => {
        console.log(response);
        // (document.getElementById('msg') as HTMLLabelElement).textContent = response?.msg
        localStorage.setItem("token", response?.token);
        this.router.navigate(['dashboard']);
        this._toastrService.success("","Login successful")
      },
      error: (error) => {
        console.log("eRROR");
        // (document.getElementById('msg') as HTMLLabelElement).textContent = error?.msg
        console.log("failed");
        this._toastrService.error("","Authentication failed");
      },
      complete:() => {

      }
    })

    // this._authService.authenticateAdmin(data).subscribe((msg) => {
    //   if (msg?.msg == "Authentication successful") {
    //     (document.getElementById('msg') as HTMLLabelElement).textContent = msg?.msg
    //     localStorage.setItem("token", msg?.token);
    //     this.router.navigate(['dashboard']);
    //     this._toastrService.success("","Login successful")
    //   }
    //   else{
    //     (document.getElementById('msg') as HTMLLabelElement).textContent = msg?.msg
    //     console.log("failed");
    //     this._toastrService.error("","Authentication failed");
    //   }
    // })
  }

}
