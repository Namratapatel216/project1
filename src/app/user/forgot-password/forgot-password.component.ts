import { Component, OnInit } from '@angular/core';

import {Router } from '@angular/router';

import { UserService } from 'src/app/user.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

import * as $ from 'jquery';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public email : any;


  constructor(private cookieService: CookieService,public _router : Router,public _userservice : UserService,private toastr: ToastrService) { }

  ngOnInit() {
  }

  public login = () => {
    this._router.navigate(['/login']);
  }

  public signUp = () => {
    this._router.navigate(['signUp']);
  }

  public forgot_pwd = () => {

    if(this.email === undefined || this.email === null || this.email === '')
    {
      this.toastr.warning("Please enter emaill address");
    }
    else{

      $('#loader').show(0);

        let params = {
          email : this.email
        }

        this._userservice.ForgotPwd(params).subscribe((apiResponse) => {
            if(apiResponse['status'] == 200)
            {
              $('#loader').hide(0);
              this.toastr.success(apiResponse['message']);
            }
            else
            {
              $('#loader').hide(0);
              this.toastr.error(apiResponse['message']);
            }
        });
    }

  }


}
