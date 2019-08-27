import { Component, OnInit } from '@angular/core';

import { EventServiceService } from 'src/app/event-service.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

import { UserService } from 'src/app/user.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-event',
  templateUrl: './admin-event.component.html',
  styleUrls: ['./admin-event.component.css']
})
export class AdminEventComponent implements OnInit {

  public M_P_AuthToken : any;

  public UserId : any;

  public UserName : any;

  public M_P_UserType : any;

  public userInfo : any;

  public get_user_list : any;

  constructor(public _userservice : UserService,public _router : Router,public _eventser : EventServiceService,public toastr : ToastrService,public cookie : CookieService) { }

  ngOnInit() {

    this.M_P_AuthToken = this.cookie.get('M_P_AuthToken');

    this.UserId = this.cookie.get('UserId');

    this.UserName = this.cookie.get('UserName');

    this.M_P_UserType = this.cookie.get('M_P_UserType');

    this.userInfo = this._userservice.getLocalStorageUserinfo();

    this.checkstatus();

    this.get_user_list = this._eventser.getallUsers().subscribe((apiresponse) => {

        if(apiresponse['status'] == 200)
        {
            this.get_user_list = apiresponse['data'];
            //console.log(this.get_user_list);
        }
        else
        {
          this.toastr.warning(apiresponse['message']);
        }

    });


  }


  public change_password = () => {
    this._router.navigate(['/change-password',this.UserId]);
  }

  public all_users = () => {

    this._router.navigate(['/Aevent']);

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

  public logout = () => {

    //alert();

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

          this._router.navigate(['/']);

          this.toastr.success(apiResponse['message']);
      }
      else
      {
          this.toastr.warning(apiResponse['message']);
      }

    });

  }

}
