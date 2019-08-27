import { Component, OnInit } from '@angular/core';

import {Router } from '@angular/router';

import { UserService } from 'src/app/user.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email : any;
  public password : any;

  public M_P_AuthToken;
  public UserId;
  public UserName;
  public M_P_UserType;
  public userInfo;

  constructor(private cookieService: CookieService,public _router : Router,public _userservice : UserService,private toastr: ToastrService) { }

  ngOnInit() {

    this.M_P_AuthToken = this.cookieService.get('M_P_AuthToken');

    this.UserId = this.cookieService.get('UserId');

    this.UserName = this.cookieService.get('UserName');

    this.M_P_UserType = this.cookieService.get('M_P_UserType');

    this.userInfo = this._userservice.getLocalStorageUserinfo();

    this.checkstatus();

  }

  public checkstatus : any = () =>
  {
      if(this.M_P_AuthToken === undefined || this.M_P_AuthToken === null || this.M_P_AuthToken === '')
      {
          this._router.navigate(['/login']);
          return false;
      }
      else
      {
          if(this.M_P_UserType == 'admin')
          {
            this._router.navigate(['/Aevent']);
          }
          else
          {
            this._router.navigate(['/per-user',this.UserId]);
          }
         
          return true;
      }
  }


  public signUp = () => {
    this._router.navigate(['/signUp']);
  }

  public login_data = () => {

    if(this.email === undefined || this.email === null || this.email === '')
    {
        this.toastr.warning('Please enter email addresss');
    }
    else if(this.password === undefined || this.password === null || this.password === '')
    {
        this.toastr.warning('Please enter password');
    }
    else
    {
        const LoginParams = {
          email : this.email,
          password : this.password
        }
        this._userservice.LoginFun(LoginParams).subscribe((apiResponse) => {

            if(apiResponse['status'] == 200)
            {
                console.log(apiResponse['data']);

                this.toastr.warning(apiResponse['message']);

                this.cookieService.set('M_P_AuthToken',apiResponse['data']['authToken'] )

                this.cookieService.set('UserId',apiResponse['data']['userDetails']['userId'] );

                this.cookieService.set('UserName',apiResponse['data']['userDetails']['firstName'] + " " + apiResponse['data']['userDetails']['lastName'] );

                let fullNAme = apiResponse['data']['userDetails']['firstName'] + " " + apiResponse['data']['userDetails']['lastName'];

                let lastfive_chars = fullNAme.substr(fullNAme.length - 5);

                this._userservice.setUserInfoLocalStorage(apiResponse['data']['userDetails']);

                console.log(lastfive_chars.toLowerCase());

                console.log(apiResponse['data']['userDetails']['is_admin']);

                if(lastfive_chars.toLowerCase() == 'admin' && apiResponse['data']['userDetails']['is_admin'] == true)
                {

                  this.cookieService.set('M_P_UserType','admin');

                  this._router.navigate(['/Aevent']);
                }
                else
                {
                  this.cookieService.set('M_P_UserType','normal');

                  this._router.navigate(['/Uevent']);

                  this._router.navigate(['/per-user',apiResponse['data']['userDetails']['userId']]);

                }

                //this._router.navigate(['/Uevent']);

            }
            else
            {
                this.toastr.error(apiResponse['message']);
            }

        });
    }

  }


}
