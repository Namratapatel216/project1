import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { HttpErrorResponse, HttpParams } from '@angular/common/http';

import { UserService } from 'src/app/user.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

import * as io from 'socket.io-client';

import { Observable, from } from 'rxjs';

import { tap } from 'rxjs/operators';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class EventServiceService {

  public userBaseUrl = "http://localhost:3000/api/v1/users";

  public eventBaseUrl = "http://localhost:3000/api/v1/meetings";

  private baseUrl = "http://localhost:3000";
  private socket;
  public authObservable;

  constructor(public _http: HttpClient, public _userservice: UserService, public toastr: ToastrService, public cookie: CookieService) {
    this.socket = io('ws://localhost:3000', { transports: ['websocket'] });
  }


  public verifyUSer = () => {
    return Observable.create((observer) => {
      this.socket.on('VerifyUser', (data) => {
        observer.next(data);
      });
    });
  }

  public onlineUSerList = () => {

    return Observable.create((observer) => {
      this.socket.on('online-user-list', (userList) => {
        observer.next(userList);
      });
    });
  }

  public setUser = (authToken) => {

    console.log("set user is called");
    this.socket.emit("set-User", authToken);
  }


  public Create_Mettting = (meeting_dataObj) => {

    this.socket.emit('create-meeting', meeting_dataObj);

  }

  public meeting_list = () => {

    return Observable.create((observer) => {
      this.socket.on('all-users-meeting-list', (userList) => {
        observer.next(userList);
      });
    });

  }

  public particular_user_meeting = (userId) => {

    return Observable.create((observer) => {

      this.socket.on(userId, (data) => {

        observer.next(data);

      }); // end Socket

    }); // end Observable

  }

  public Logout = (data) => {

    let get_data = new HttpParams()
      .set('userId', data.userId);


    let response = this._http.post(`${this.userBaseUrl}/logOut`, get_data);
    //alert(response);
    return response;

  }

  public getallUsers = () => {

    let response = this._http.get(`${this.userBaseUrl}/view/all`);
    return response;

  }

  public GetallEventsOfUSer = (sender_receiver_obj, current_year, current_month) => {

    let params;
    if (sender_receiver_obj.meeting_created_by != null || sender_receiver_obj.meeting_created_by != undefined) {
      params = new HttpParams()
        .set('meeting_created_by', sender_receiver_obj.meeting_created_by)
        .set('meeting_created_for', sender_receiver_obj.meeting_created_for)
        .set('month', current_month)
        .set('year', current_year)
      //.set('month','7');
    }
    else {
      params = new HttpParams()
        .set('meeting_created_for', sender_receiver_obj.meeting_created_for)
        .set('month', current_month)
        .set('year', current_year)
      //.set('month','7');
    }


    //console.log(params);

    let response = this._http.post(`${this.eventBaseUrl}/Perticular-User-meeting`, params);
    return response;

  }


  public update_meeting = (updated_meeting_data) => {

    this.socket.emit('update-meeting', updated_meeting_data);

  }

  public delete_meeting = (meeting_delete_obj) => {

    this.socket.emit('delete-meeting', meeting_delete_obj);

  }

  public getCurrentDateData = (sender_receiver_obj) => {

    let params;
    if (sender_receiver_obj.meeting_created_by != null || sender_receiver_obj.meeting_created_by != undefined) {
      params = new HttpParams()
        .set('meeting_created_by', sender_receiver_obj.meeting_created_by)
        .set('meeting_created_for', sender_receiver_obj.meeting_created_for)
      //.set('month','7');
    }
    else {
      params = new HttpParams()
        .set('meeting_created_for', sender_receiver_obj.meeting_created_for)
      //.set('month','7');
    }

    console.log(params);

    let response = this._http.post(`${this.eventBaseUrl}/every-minute-data`,params);
    return response;

  }

  public getReminder = (event_data) => {

    this.socket.emit('Reminder', event_data);

  }

}
