import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation, OnInit,
  ViewChild,
  TemplateRef
} from '@angular/core';


import { EventServiceService } from 'src/app/event-service.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

import { UserService } from 'src/app/user.service';

import { ActivatedRoute, Router } from '@angular/router';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { Observable } from 'rxjs';

import { interval, fromEvent } from 'rxjs';

import { switchMap } from 'rxjs/operators';

import 'rxjs/add/observable/interval';

import * as $ from 'jquery';

import {
  CalendarEvent, CalendarMonthViewDay,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';

import {
  subMonths,
  addMonths,
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';

import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import { $ } from 'protractor';


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};


type CalendarPeriod = 'day' | 'week' | 'month';

function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth
  }[period](date);
}

interface MyEvent extends CalendarEvent {
  eventId: string,
  meeting_place: string;
}

@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './particular-user-event.component.html',
  styleUrls: ['./particular-user-event.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ParticularUserEventComponent implements OnInit {

  datePickerConfig: Partial<BsDatepickerConfig>;


  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  @ViewChild('modalContent_form', { static: true }) modalContent_form: TemplateRef<any>;

  @ViewChild('View_meeting_data', { static: true }) View_meeting_data: TemplateRef<any>;

  @ViewChild('update_meeting_form', { static: true }) update_meeting_form: TemplateRef<any>;

  @ViewChild('delete_confirm', { static: true }) delete_confirm: TemplateRef<any>;

  @ViewChild('alert_creation_module', { static: true }) alert_creation_module: TemplateRef<any>;

  @ViewChild('alert_updation_module', { static: true }) alert_updation_module: TemplateRef<any>;

  @ViewChild('event_notification', { static: true }) event_notification: TemplateRef<any>;

  view: CalendarPeriod = 'month';

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  events: MyEvent[] = [];

  todays_event = [];

  actions: CalendarEventAction[] = [];

  current_date = new Date();

  current_date_months = new Date().getMonth();


  public current_year_data = new Date().getFullYear();

  min_new_date = new Date(`January 1, ${this.current_year_data} 00:00:00`);

  max_new_date = new Date(`December 31, ${this.current_year_data} 00:00:00`);

  minDate: Date = this.min_new_date;

  maxDate: Date = this.max_new_date;

  small_calendar_minDate = new Date();


  prevBtnDisabled: boolean = false;

  nextBtnDisabled: boolean = false;

  public update_meetings: any;

  public M_P_AuthToken: any;

  public UserId: any;

  public UserName: any;

  public M_P_UserType: any;

  public userInfo: any;

  public meeting_end_date;


  public userList: any = [];

  public meeting_list = [];

  public disconnectedSocket: boolean;

  public show_module_create_data;

  public show_module_change_data;

  public only_todays_event_stroed;
  public delete_todays_event

  public sub;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  refresh: Subject<any> = new Subject();


  activeDayIsOpen: boolean = false;

  public selected_userId;

  public sender_receiver_obj;
  constructor(public actiroute: ActivatedRoute, private modal: NgbModal, public _userservice: UserService, public _router: Router, public _eventser: EventServiceService, public toastr: ToastrService, public cookie: CookieService) {

    this.datePickerConfig = Object.assign({}, {
      minDate: new Date(this.current_year_data, 0, 1),
      maxDate: new Date(this.current_year_data, 11, 31)

    });

  }

  ngOnInit() {

    this.selected_userId = this.actiroute.snapshot.paramMap.get("userId");

    this.M_P_AuthToken = this.cookie.get('M_P_AuthToken');

    this.UserId = this.cookie.get('UserId');

    this.UserName = this.cookie.get('UserName');

    this.M_P_UserType = this.cookie.get('M_P_UserType');

    this.userInfo = this._userservice.getLocalStorageUserinfo();

    this.checkstatus();

    this.verifyUserConfirmation();

    this.getOnlineUserList();

    if (this.M_P_UserType == 'admin') {
      this.sender_receiver_obj = {
        meeting_created_by: this.UserId,
        meeting_created_for: this.selected_userId
      }
    }
    else {
      this.sender_receiver_obj = {
        meeting_created_for: this.selected_userId
      }
    }

    this.todays_event_data(this.sender_receiver_obj);

    this.get_all_meetings_of_user(this.sender_receiver_obj, this.current_year_data, this.current_date_months);

    this.getMeetings_from_admin();



  }


  get_all_meetings_of_user = (sender_reciver_obj_, current_year, current_month) => {
    this.events = [];

    this._eventser.GetallEventsOfUSer(sender_reciver_obj_, current_year, current_month).subscribe((apiResponse) => {

      if (apiResponse['status'] == 200) {

        for (let x_meeting of apiResponse['data']) {

          this.events = [
            ...this.events,
            {
              eventId: x_meeting['eventId'],
              meeting_place: x_meeting['meeting_place'],
              title: x_meeting['meeting_purpose'],
              start: new Date(x_meeting['meeting_start_date']),
              end: new Date(x_meeting['meeting_end_date']),
              actions: this.actions,
              color: colors.red,
            }
          ];

        }
      }
      else {

      }

      this.refresh.next();

      this.every_Minute_data();

    });

  }


  public todays_event_data = (sender_receiver_obj) => {

    this._eventser.getCurrentDateData(this.sender_receiver_obj).subscribe((apiResponse) => {
      if (apiResponse['status'] == 200) {

        for (let today_m_data of apiResponse['data']) {

          this.todays_event = [
            ...this.todays_event,
            {
              eventId: today_m_data['eventId'],
              meeting_created_for: today_m_data['meeting_created_for'],
              meeting_created_by: today_m_data['meeting_created_by'],
              meeting_place: today_m_data['meeting_place'],
              title: today_m_data['meeting_purpose'],
              start: new Date(today_m_data['meeting_start_date']),
              end: new Date(today_m_data['meeting_end_date']),
              actions: this.actions,
              color: colors.red,
              time_gone: false
            }

          ]

        }

      }
      else {
        console.log("else")
      }
    });


  }

  public all_users = () => {

    this._router.navigate(['/Aevent']);

  }

  public checkstatus: any = () => {
    if (this.M_P_UserType == 'admin') {
      this.actions = [
        ...this.actions,
        {
          label: '<i class="fa fa-fw fa-pencil"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.handleEvent('Edited', event);
          }
        },
        {
          label: '<i class="fa fa-fw fa-times"></i>',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            //this.events = this.events.filter(iEvent => iEvent !== event);
            this.handleEvent('Deleted', event);
          }
        }
      ];
    }
    else {
      this.actions = [];
    }


    if (this.M_P_AuthToken === undefined || this.M_P_AuthToken === null || this.M_P_AuthToken === '') {
      this._router.navigate(['/login']);
      return false;
    }
    else {
      return true;
    }
  }

  public verifyUserConfirmation = () => {

    this._eventser.verifyUSer().subscribe((data) => {

      this.disconnectedSocket = false;

      this._eventser.setUser(this.M_P_AuthToken);

    });

  }

  public getOnlineUserList = () => {

    this._eventser.onlineUSerList().subscribe((userList1) => {

      //alert(JSON.stringify(userList1));

      this.userList = [];

      for (let x in userList1) {
        let user = { userId: userList1[x]['userId'], userName: userList1[x]['fullname'] };

        this.userList.push(user);

        console.log(this.userList);

      }

    });


  }

  public change_password = () => {
    this._router.navigate(['/change-password', this.UserId]);
  }

  public edit_profile = () => {
    this._router.navigate(['/edit-profile', this.UserId]);
  }


  public logout = () => {

    //alert();

    let logged_in_userId = this.cookie.get('UserId');

    let userId_data = {
      userId: logged_in_userId
    }

    this._eventser.Logout(userId_data).subscribe((apiResponse) => {
      //alert(apiResponse);
      if (apiResponse['status'] == 200) {
        this.cookie.delete('M_P_AuthToken');

        this.cookie.delete('UserId');

        this.cookie.delete('UserName');

        this.cookie.delete('M_P_UserType');

        this._userservice.setUserInfoLocalStorage("");

        this._router.navigate(['/']);

        this.toastr.success(apiResponse['message']);
      }
      else {
        this.toastr.warning(apiResponse['message']);
      }

    });

  }

  increment(): void {
    //alert();
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    //alert();
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    //alert();
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }


  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    this.dateOrViewChanged();
    this.activeDayIsOpen = false;
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }

    let viewDateMonth = this.viewDate.getMonth();
    let ViewDateYear = this.viewDate.getFullYear();
    //alert(this.viewDate.getMonth();
    this.get_all_meetings_of_user(this.sender_receiver_obj, ViewDateYear, viewDateMonth);
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {

      if (
        (isSameDay(this.viewDate, date)) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  /*eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  } */

  public view_Content;

  handleEvent(action: string, event: CalendarEvent): void {

    if (action === 'Clicked') {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
      this.modalData = { event, action };
      this.view_Content = event;
      this.modal.open(this.View_meeting_data, { size: 'lg', keyboard: false, backdrop: 'static' });
    }
    else if (action === 'Edited') {

      event.start = new Date(event.start);
      event.end = new Date(event.end);
      this.modalData = { event, action };

      this.update_meetings = event;
      this.modal.open(this.update_meeting_form, { size: 'lg', keyboard: false, backdrop: 'static' });
    }
    else if (action === 'Deleted') {
      this.modalData = { event, action };
      this.modal.open(this.delete_confirm, { size: 'lg', keyboard: false, backdrop: 'static' });
    }

  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  addEvent_form() {

    this.modal.open(this.modalContent_form, { size: 'lg', keyboard: false, backdrop: 'static' });

  }

  confirm_delete(eventId): void {
    //alert(eventId);
    let some_data = {
      eventId: eventId,
      meeting_created_for: this.selected_userId
    }
    this._eventser.delete_meeting(some_data);

    var button_delete_meetng = document.getElementById("delete_close_btn");
    button_delete_meetng.click();

  }

  confirm_decline(): void {

    var button_delete_meetng = document.getElementById("delete_close_btn");
    button_delete_meetng.click();

  }

  public created_by;
  public meeting_purpose;
  public meeting_place;
  public meeting_date;
  public created_for;

  public create_meeting_form() {

    //alert(this.meeting_date);

    if (this.meeting_purpose === undefined || this.meeting_purpose === null || this.meeting_purpose === '') {
      this.toastr.warning("Please enter Metting Purpose")
    }
    else if (this.meeting_place === undefined || this.meeting_place === null || this.meeting_place === '') {
      this.toastr.warning("Please enter Meeting Place");
    }
    else if (this.meeting_date === undefined || this.meeting_date === null || this.meeting_date === '') {
      this.toastr.warning("Please select Meeting Start date time and meeting end date time");
    }
    else if (this.meeting_end_date === undefined || this.meeting_end_date === null || this.meeting_end_date === '') {
      this.toastr.warning("Please select meeting End date and meeting end time");
    }
    else if (Date.parse(this.meeting_date) > Date.parse(this.meeting_end_date)) {
      this.toastr.warning("Please select propert strat and end date time.")
    }
    else {

      this.meeting_date = this.meeting_date.setSeconds(0);
      this.meeting_end_date = this.meeting_end_date.setSeconds(0);

      let meeting_dataObj = {
        meeting_created_by: this.UserId,
        meeting_purpose: this.meeting_purpose,
        meeting_place: this.meeting_place,
        meeting_start_date: this.meeting_date,
        meeting_created_for: this.selected_userId,
        meeting_end_date: this.meeting_end_date,
        createdOn: new Date()
      }

      this._eventser.Create_Mettting(meeting_dataObj);
      $(document).ready(function () {
        var button_create_meetng = document.getElementById("create_close_btn");
        button_create_meetng.click();
      });

    }

  }

  

  public pushToEvents = (meeting_dataObj) => {

    console.log("push events called");

    if (meeting_dataObj.meeting_start_date != undefined || meeting_dataObj.meeting_start_date != null || meeting_dataObj.meeting_start_date != '') {

      console.log("push events if part called" + JSON.stringify(meeting_dataObj));

      this.events = [
        ...this.events,
        {
          eventId: meeting_dataObj.eventId,
          meeting_place: meeting_dataObj.meeting_place,
          title: meeting_dataObj.meeting_purpose,
          start: new Date(meeting_dataObj.meeting_start_date),
          end: new Date(meeting_dataObj.meeting_end_date),
          color: colors.red,
          actions: this.actions
        }
      ];

      let todays_date: any = new Date();
      let event_start_time: any = new Date(meeting_dataObj.meeting_start_date);
      var diffMs = (event_start_time - todays_date); // milliseconds between now & Christmas
      var diffDays = Math.floor(diffMs / 86400000); // days
      if(diffDays === 0)
      {
        this.todays_event = [
          ...this.todays_event,
          {
            eventId: meeting_dataObj.eventId,
            meeting_place: meeting_dataObj.meeting_place,
            title: meeting_dataObj.meeting_purpose,
            start: new Date(meeting_dataObj.meeting_start_date),
            end: new Date(meeting_dataObj.meeting_end_date),
            color: colors.red,
            actions: this.actions
          }
        ]
      }

      

      console.log("events are " + JSON.stringify(this.events));

      this.refresh.next();

    }
  }

  public Update_meeting = () => {

    if (this.update_meetings.title === undefined || this.update_meetings.title === null || this.update_meetings.title === '') {
      this.toastr.warning("Please enter Metting Purpose")
    }
    else if (this.update_meetings.meeting_place === undefined || this.update_meetings.meeting_place === null || this.update_meetings.meeting_place === '') {
      this.toastr.warning("Please enter Meeting Place");
    }
    else if (this.update_meetings.start === undefined || this.update_meetings.start === null || this.update_meetings.start === '') {
      this.toastr.warning("Please select Meeting Start date time and meeting end date time");
    }
    else if (this.update_meetings.end === undefined || this.update_meetings.end === null || this.update_meetings.end === '') {
      this.toastr.warning("Please select Meeting end date and time");
    }
    else if (Date.parse(this.update_meetings.start) >= Date.parse(this.update_meetings.end)) {
      this.toastr.warning("Please select proper sttart date and time");
    }
    else {

      this.update_meetings.start = this.update_meetings.start.setSeconds(0);
      this.update_meetings.end = this.update_meetings.end.setSeconds(0);
      let update_meeting_data_obj = {

        eventId: this.update_meetings.eventId,
        meeting_purpose: this.update_meetings.title,
        meeting_place: this.update_meetings.meeting_place,
        meeting_start_date: this.update_meetings.start,
        meeting_end_date: this.update_meetings.end,
        meeting_created_for: this.selected_userId

      }

      this._eventser.update_meeting(update_meeting_data_obj);

      $(document).ready(function () {
        var button_update_meetng = document.getElementById("update_close_btn");
        button_update_meetng.click();
      });

    }

  }


  public only_one_event_stroed: any;
  public delete_event: boolean = false;
  public reminder_data;

  public getMeetings_from_admin = () => {

    this._eventser.particular_user_meeting(this.selected_userId)
      .subscribe((data) => {

        if (data['action'] === "create") {
          //alert("meeting created");
          if ((data['meeting_created_by'] != this.UserId) && (data['meeting_purpose'] != undefined || data['meeting_purpose'] != null || data['meeting_purpose'] != '') && data != 'You are ONline') {
            let meeting_dataObj = {
              eventId: data['eventId'],
              meeting_created_by: data['meeting_created_by'],
              meeting_purpose: data['meeting_purpose'],
              meeting_place: data['meeting_place'],
              meeting_start_date: data['meeting_start_date'],
              meeting_end_date: data['meeting_end_date'],
              meeting_created_for: data['meeting_created_by'],
              createdOn: new Date()
            }
            this.pushToEvents(meeting_dataObj);

            // alert("meeting created");
            data['meeting_start_date'] = new Date(data['meeting_start_date']);
            data['meeting_end_date'] = new Date(data['meeting_end_date']);
            this.show_module_create_data = data;
            console.log("meeting start date" + data['meeting_start_date']);

            this.modal.open(this.alert_creation_module, { size: 'lg' });
            

          }
          else if ((data['meeting_created_by'] == this.UserId) && (data['meeting_purpose'] != undefined || data['meeting_purpose'] != null || data['meeting_purpose'] != '') && data != 'You are ONline') {
            let meeting_dataObj = {
              eventId: data['eventId'],
              meeting_created_by: data['meeting_created_by'],
              meeting_purpose: data['meeting_purpose'],
              meeting_place: data['meeting_place'],
              meeting_start_date: data['meeting_start_date'],
              meeting_end_date: data['meeting_end_date'],
              meeting_created_for: data['meeting_created_by'],
              createdOn: new Date()
            }
            this.pushToEvents(meeting_dataObj);

            this.toastr.success("Meeting Scheduled Successfully");
          }
        }
        else if (data['action'] === "update") {
          //alert("meeting updated");
          this.events = this.events.map(iEvent => {

            if (iEvent.eventId === data['eventId']) {
              let updated_meeting_obj = {
                meeting_purpose: data['meeting_purpose'],
                meeting_place: data['meeting_place'],
                meeting_start_date: data['meeting_start_date'],
                meeting_end_date: data['meeting_end_date']
              }

              return {
                title: updated_meeting_obj.meeting_purpose,
                eventId: iEvent.eventId,
                meeting_place: updated_meeting_obj.meeting_place,
                start: new Date(updated_meeting_obj.meeting_start_date),
                end: new Date(updated_meeting_obj.meeting_end_date),
                color: iEvent.color,
                actions: iEvent.actions
              };
            }
            return iEvent;
          });

          this.todays_event = this.todays_event.map((event) => {

            if (event.eventId === data['eventId']) {

              let updated_meeting_obj = {
                meeting_purpose: data['meeting_purpose'],
                meeting_place: data['meeting_place'],
                meeting_start_date: data['meeting_start_date'],
                meeting_end_date: data['meeting_end_date'],

              }
              return {
                title: updated_meeting_obj.meeting_purpose,
                eventId: event.eventId,
                meeting_place: updated_meeting_obj.meeting_place,
                start: new Date(updated_meeting_obj.meeting_start_date),
                end: new Date(updated_meeting_obj.meeting_end_date),
                color: event.color,
                actions: event.actions,
                meeting_created_for: event.meeting_created_for,
                meeting_created_by: event.meeting_created_by,
                time_gone: event.time_gone
              };

            }
            return event;
          });

          this.refresh.next();

          if (this.M_P_UserType === 'admin') {
            this.toastr.success("Meeting is changed Successfully");
          }
          else {
            //let converte_start_date = data['meeting_start_date'];
            //console.log(converte_start_date);
            //data['meeting_start_date'] = converte_start_date;
            data['meeting_start_date'] = new Date(data['meeting_start_date']);
            data['meeting_end_date'] = new Date(data['meeting_end_date']);
            this.show_module_change_data = data;

            this.modal.open(this.alert_updation_module, { size: 'lg' });
          }

        }
        else if (data['action'] === "delete") {
          //alert("meeting deleted");

          this.events = this.events.map(iEvent => {

            if (iEvent.eventId === data['eventId']) {
              this.only_one_event_stroed = iEvent;
              this.delete_event = true;
              //return false;
            }
            return iEvent;
          });

          this.todays_event = this.todays_event.map((event) => {

            if (event.eventId === data['eventId']) {
              this.only_todays_event_stroed = event;
              this.delete_todays_event = true;
            }
            return event;
          });


          if (this.delete_event === true) {
            this.events = this.events.filter(event => event !== this.only_one_event_stroed);
          }

          if (this.delete_todays_event === true) {
            this.todays_event = this.todays_event.filter(event => event !== this.only_todays_event_stroed);
          }


          this.refresh.next();

          if (this.M_P_UserType === 'admin') {
            this.toastr.success("Meeting is deleted Successfully");
          }
          else {

          }
        }
        else if (data['action'] == 'reminder') {
          if (data['meeting_created_for'] == this.UserId && data['meeting_created_by'] != this.UserId) {
            let stat_time = new Date(data['start']);
            this.setAlarm(stat_time);

            this.reminder_data = data;

            this.todays_event = this.todays_event.map((event) => {

              if (event.eventId === data['eventId']) {
                return {
                  title: event.meeting_purpose,
                  eventId: event.eventId,
                  meeting_place: event.meeting_place,
                  start: event.start,
                  end: event.end,
                  color: event.color,
                  actions: event.actions,
                  meeting_created_for: event.meeting_created_for,
                  meeting_created_by: event.meeting_created_by,
                  time_gone: true
                };

              }
              return event;
            });

            this.refresh.next();

          }
        }


      });
  }


  public todays_past_events_ids = [];

  public every_Minute_data = () => {

    /*let current_date = new Date();
    current_date.setSeconds(0);

    if(current_date.getMinutes() == 59)
    {
      current_date.setHours(current_date.getHours() + 1);
      current_date.setMinutes(0);
    } */

    //console.log(this.todays_event);


    // console.log(event.start);
    //console.log(current_date + " current date");


    this.todays_event.map((event) => {


      let todays_date: any = new Date();
      let event_start_time: any = new Date(event.start);
      var diffMs = (event_start_time - todays_date); // milliseconds between now & Christmas
      var diffDays = Math.floor(diffMs / 86400000); // days
      var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

      console.log("diff in days" + diffDays);
      console.log("diff in hours" + diffHrs);
      console.log(diffMins);

      if(this.todays_past_events_ids.indexOf(event.eventId) !== -1)
      {
          console.log("event id is in array" + event.eventId);
      }
      else
      {
          if(todays_date.getDate() === event_start_time.getDate())
          {
              if ((diffDays === 0) && (diffHrs === 0 ) && ( ((diffMins === 1) || (diffMins === 0)) )) {

                this._eventser.getReminder(event);
        
                this.todays_past_events_ids.push(event.eventId);
        
              }
          }

          
      }

      

      /* if ((event.time_gone === false) && (event.start.getHours() === current_date.getHours()) && (event.start.getMinutes() === (current_date.getMinutes() + 1))) {

        this._eventser.getReminder(event);

      } */

    });

  }

  public time_out_data;

  public setAlarm = (start_date_and_time) => {

    //alert();
    let ms = start_date_and_time;
    console.log(ms);

    if (isNaN(ms)) {

    }
    else {
      var alarm = new Date(ms);
      console.log("alarm" + alarm);
      var alarmTime = new Date(alarm.getUTCFullYear(), alarm.getUTCMonth(), alarm.getUTCDate(), alarm.getUTCHours(), alarm.getUTCMinutes(), alarm.getUTCSeconds());
      console.log("alarm time " + alarmTime);
      var differenceInms = alarmTime.getTime() - (new Date()).getTime();
      //differenceInms = 60000;

      if (differenceInms > 0) {
        alert('specified time is already passed');
        return;
      }

      this.time_out_data = setTimeout(this.initAlarm, differenceInms)


    }

  }

  public initAlarm = () => {

    //this.reminder_data.start;
    let start_m_ti = new Date(this.reminder_data.start);
    console.log("reminder strat time" + start_m_ti);

    this.modal.open(this.event_notification, { size: 'lg', keyboard: false, backdrop: 'static' });

    let current_date_data = new Date();
    current_date_data.setSeconds(0);

    if (current_date_data.getMinutes() == 59) {
      current_date_data.setHours(current_date_data.getHours() + 1);
      current_date_data.setMinutes(0);
    }

    if ((current_date_data.getHours() == start_m_ti.getHours()) && (current_date_data.getMinutes() == start_m_ti.getMinutes())) {
      clearTimeout(this.time_out_data);
    }

  }

  public dismiss = () => {
    // this.modal.clo(this.event_notification, { size: 'lg', keyboard: false,backdrop: 'static'});

    console.log("dismiss");

    $(document).ready(function () {
      var event_notification_close = document.getElementById("event_notification_close_btn");
      event_notification_close.click();
    });

  }

  public snooze = () => {

    $(document).ready(function () {
      var event_notification_close = document.getElementById("event_notification_close_btn");
      event_notification_close.click();
    });

    setTimeout(this.initAlarm, 5000);

  }


  public sub1 = Observable.interval(30000)
    .subscribe((val) => {
      this.every_Minute_data();
      console.log('called');

    });

}
