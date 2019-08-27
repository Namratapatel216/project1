import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { EventServiceService } from 'src/app/event-service.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

import { UserService } from 'src/app/user.service';

//import { Router } from '@angular/router';

import * as $ from 'jquery';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  public M_P_AuthToken : any;

  public UserId : any;

  public UserName : any;

  public M_P_UserType : any;

  public userInfo : any;

  public old_password;

  public new_password;

  public repeat_new_password;

  constructor(public actiroute:ActivatedRoute,public _userservice : UserService,public _router : Router,public _eventser : EventServiceService,public toastr : ToastrService,public cookie : CookieService) { }

  ngOnInit() {

    this.M_P_AuthToken = this.cookie.get('M_P_AuthToken');

    this.UserId = this.cookie.get('UserId');

    this.UserName = this.cookie.get('UserName');

    this.M_P_UserType = this.cookie.get('M_P_UserType');

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
          return true;
      }
  }


  public edit_profile = () =>
  {
      this._router.navigate(['/edit-profile',this.UserId]);
  }

  public change_password = () => {
    this._router.navigate(['/change-password',this.UserId]);
  }

  public logout = () => {


    let logged_in_userId = this.cookie.get('UserId');

    let userId_data = {
      userId : logged_in_userId
    }

    this._eventser.Logout(userId_data).subscribe((apiResponse) => {
      //alert(apiResponse);
      if(apiResponse['status'] == 200)
      {
          this.cookie.delete('M_P_AuthToken');

          this.cookie.delete('UserId');

          this.cookie.delete('UserName');

          this.cookie.delete('M_P_UserType');

          this._userservice.setUserInfoLocalStorage("");

          this._router.navigate(['/login']);

          this.toastr.success(apiResponse['message']);
      }
      else
      {
          this.toastr.warning(apiResponse['message']);
      }

    });

  }


  public change_password_data = () => {

    if(this.old_password === undefined || this.old_password === null || this.old_password === '')
    {
        this.toastr.warning("Please enter old password");
    }
    else if(this.new_password === undefined || this.new_password === null || this.new_password === '')
    {
        this.toastr.warning("Please enter new password");
    }
    else if(this.repeat_new_password === undefined || this.repeat_new_password === null || this.repeat_new_password === '')
    {
        this.toastr.warning("Please enter repeat password");
    }
    else if(this.new_password != this.repeat_new_password)
    {
        this.toastr.warning("New password and repeate new password does not match");
    }
    else
    {
        let change_pwd_params = {
          old_password : this.old_password,
          new_password : this.new_password,
          userId : this.UserId
        }

        this._userservice.change_Pwd(change_pwd_params).subscribe((apiResponse) => {

            if(apiResponse['status'] == 200)
            {
                this.toastr.success(apiResponse['message']);
            }    
            else
            {
              this.toastr.error(apiResponse['message']);
            }
        });
    }

  }

}
