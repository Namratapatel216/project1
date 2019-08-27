import { Component, OnInit } from '@angular/core';

import {ActivatedRoute, Router } from '@angular/router';

import { UserService } from 'src/app/user.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.css']
})
export class VerifyUserComponent implements OnInit {

  constructor(public actiroute:ActivatedRoute,private cookieService: CookieService,public _router : Router,public _userservice : UserService,private toastr: ToastrService) { }

  ngOnInit() {

    let token = this.actiroute.snapshot.paramMap.get("Token");
    let Token_res = {
      Token : token
    }

     this._userservice.verify_useer_token(Token_res).subscribe(
      (apiResponse) => {

        if(apiResponse['status'] == 200)
        {
          this.toastr.success(apiResponse['message']);
          this._router.navigate(['/login']);
        }
        else
        {
            this.toastr.warning(apiResponse['message']);
            //this._router.navigate(['/forgot-password']);
        }

      });

  }

}
