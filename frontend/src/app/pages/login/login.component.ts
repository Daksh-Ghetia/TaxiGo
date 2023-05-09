import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(private _authService: AuthService, private router: Router,) { }

  ngOnInit() {
    
  }
  ngOnDestroy() {
  }

  Authenticate() {
    
    let email = (document.getElementById('email') as HTMLInputElement).value;
    let pass = (document.getElementById('password') as HTMLInputElement).value;
    
    let data: any = {email: email, password: pass};

    this._authService.authenticateAdmin(data).subscribe((msg) => {

      console.log(msg);
      
      if (msg?.msg == "Authentication successful") {
        (document.getElementById('msg') as HTMLLabelElement).textContent = msg?.msg
        localStorage.setItem("token", msg?.token);
        this.router.navigate(['dashboard'])
      }
      else{
        (document.getElementById('msg') as HTMLLabelElement).textContent = msg?.msg
        console.log("failed");
      }
    })
  }

}
