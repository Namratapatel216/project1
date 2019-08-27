import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from 'src/app/user.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {

  public password;
  public email;
  public email_from_token;

  

  constructor(public actiroute:ActivatedRoute,private cookieService: CookieService,public _router : Router,public _userservice : UserService,private toastr: ToastrService) { }

  ngOnInit() {

    let token = this.actiroute.snapshot.paramMap.get("Token");
    let Token_res = {
      Token : token
    }
    
    this.email_from_token = this._userservice.getemail_from_token(Token_res).subscribe(
      (apiResponse) => {

        if(apiResponse['status'] == 200)
        {
          this.email_from_token = apiResponse['data']['email'];
          //alert(this.email_from_token);
        }
        else
        {
            this.toastr.warning(apiResponse['message']);
            this._router.navigate(['/forgot-password']);
        }

      });

  }

  public change_pwd = () => {
    
    if(this.password === undefined || this.password === null || this.password === '')
    {
      this.toastr.warning("Please enter password");
    }
    else
    {
      let params = {
        email : this.email_from_token,
        password : this.password
      }

      //alert(params);

      this._userservice.recover_pwd(params).subscribe((apirespoonse) => {

          if(apirespoonse['status'] == 200)
          {
            this.toastr.success(apirespoonse['message']);
            this._router.navigate(['/login']);
          }
          else
          {
            this.toastr.error(apirespoonse['message']);
          }

      });
    }


  }

}
