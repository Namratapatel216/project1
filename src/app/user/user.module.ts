import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';

import {FormsModule} from '@angular/forms';


import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { VerifyUserComponent } from './verify-user/verify-user.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';



@NgModule({
  declarations: [LoginComponent, SignupComponent, ForgotPasswordComponent, RecoverPasswordComponent, VerifyUserComponent, EditProfileComponent, ChangePasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {path:'signUp',component:SignupComponent},
      {path:'forgot-password',component:ForgotPasswordComponent},
      {path:'recover-password/:Token',component:RecoverPasswordComponent},
      {path:'Verify-User/:Token',component:VerifyUserComponent},
      {path:'edit-profile/:userId',component:EditProfileComponent},
      {path:'change-password/:userId',component:ChangePasswordComponent}
    ])
  ]
})
export class UserModule { }
