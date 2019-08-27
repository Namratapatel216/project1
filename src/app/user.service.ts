import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { HttpErrorResponse, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public baseUrl = "http://localhost:3000/api/v1/users";

  constructor(public _http : HttpClient) { }

  public setUserInfoLocalStorage = (data) => {

    localStorage.setItem('M_P_userInfo',JSON.stringify(data));

  }

  public getLocalStorageUserinfo = () => {
    localStorage.getItem('M_P_userInfo');
  }

  public LoginFun = (LoginParams) => {

    const params = new HttpParams()
                    .set('email',LoginParams.email)
                    .set('password',LoginParams.password)


    let response = this._http.post(`${this.baseUrl}/login`,params);
    //alert(response);
    return response;

  }

  public getCountry_ = () => {

      let c_l = "http://country.io/names.json";
      let response = this._http.post(`${c_l}`,'');
      //alert(JSON.stringify(response));
      return response;

  }

  public ForgotPwd = (params) => {

    const dat = new HttpParams()
                .set('email',params.email);

    let response = this._http.post(`${this.baseUrl}/forgot-password`,dat);
    return response;

  }

  public getemail_from_token = (token) => {
      let data = new HttpParams()
                  .set('Token',token.Token)

      //alert(data);

      let response = this._http.post(`${this.baseUrl}/get-email`,data);
      return response;
  }

  public recover_pwd = (params) => {
    const data = new HttpParams()
                .set('email',params.email)
                .set('password',params.password);
    //alert(data);

    let response = this._http.post(`${this.baseUrl}/recover-password`,data);
    return response;
  }


  public signUp = (signup_data) => {

    let data = new HttpParams()
                .set('email',signup_data.email)
                .set('password',signup_data.password)
                .set('firstName',signup_data.firstname)
                .set('lastName',signup_data.lastName)
                .set('mobileNumber',signup_data.mobileNumber)
                .set('country_code',signup_data.country_code)
                .set('country_name',signup_data.country_name)

    let reponse = this._http.post(`${this.baseUrl}/signUp`,data);
    return reponse;

  }

  public verify_useer_token = (token_data) => {


    let t_data = new HttpParams()
                  .set('Token',token_data.Token)

    //alert(t_data);

    let reponse = this._http.post(`${this.baseUrl}/Verify-User`,t_data);
    return reponse;

  }

  public get_single_user_data = (userId) => {

    let apiResponse = this._http.get(`${this.baseUrl}/${userId}/singleUSer`);

    return apiResponse;

  }

  public edit_profile_htp = (user_id,User_data) => {

    let get_perticular_data = this._http.put(this.baseUrl + '/'+ user_id + '/edit-profile', User_data);
      console.log(get_perticular_data);
      return get_perticular_data;

  }

  public change_Pwd = (change_pwd_data) => {

    let params = new HttpParams()
                  .set('old_password',change_pwd_data.old_password)
                  .set('userId',change_pwd_data.userId)
                  .set('new_password',change_pwd_data.new_password);

    console.log(params);
    let reponse = this._http.post(`${this.baseUrl}/change-password`,params);
    return reponse;

  }

}
