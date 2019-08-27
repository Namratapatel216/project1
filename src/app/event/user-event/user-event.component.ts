import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,OnInit,
  ViewChild,
  TemplateRef
} from '@angular/core';


import { EventServiceService } from 'src/app/event-service.service';

import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';

import { UserService } from 'src/app/user.service';

import { ActivatedRoute, Router } from '@angular/router';

import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';

import * as $ from 'jquery';

import { CalendarEvent, CalendarMonthViewDay, 
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView } from 'angular-calendar';

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


@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-event.component.html',
  styleUrls: ['./user-event.component.css']
})
export class UserEventComponent implements OnInit {

  datePickerConfig : Partial<BsDatepickerConfig>; 


  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  @ViewChild('modalContent_form', { static: true }) modalContent_form: TemplateRef<any>;
  

  view: CalendarPeriod = 'month';

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  //events: CalendarEvent[] = [];

  current_date = new Date();

  current_date_months = new Date().getMonth();


  public current_year_data = new Date().getFullYear();

  min_new_date = new Date(`Januaru 1, ${this.current_year_data} 00:00:00`);

  max_new_date = new Date(`December 31, ${this.current_year_data} 00:00:00`);

  minDate: Date = this.min_new_date;

  maxDate: Date = this.max_new_date;


  prevBtnDisabled: boolean = false;

  nextBtnDisabled: boolean = false;

  public M_P_AuthToken : any;

  public UserId : any;

  public UserName : any;

  public M_P_UserType : any;

  public userInfo : any;

  
  public userList: any = [];

  public meeting_list = [];

  public disconnectedSocket: boolean;  

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    /*{
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: new Date(),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true
    } */
  ];

  activeDayIsOpen: boolean = false;

  public selected_userId;

  constructor(public actiroute:ActivatedRoute,private modal: NgbModal,public _userservice : UserService,public _router : Router,public _eventser : EventServiceService,public toastr : ToastrService,public cookie : CookieService) { 
    
    this.datePickerConfig = Object.assign({},{
      minDate : new Date(2019,0,1),
      maxDate : new Date(2019,11,31)

    });

  }

  ngOnInit() {

    this.selected_userId = this.actiroute.snapshot.paramMap.get("userId");

    //alert(this.selected_userId);

    this.M_P_AuthToken = this.cookie.get('M_P_AuthToken');

    this.UserId = this.cookie.get('UserId');

    this.UserName = this.cookie.get('UserName');

    this.M_P_UserType = this.cookie.get('M_P_UserType');

    this.userInfo = this._userservice.getLocalStorageUserinfo();

    this.checkstatus();

    this.verifyUserConfirmation();

    this.getOnlineUserList();

    let sender_receiver_obj = {

      meeting_created_by : this.UserId,
      meeting_created_for : this.selected_userId
    }

    this.get_meetings(sender_receiver_obj);

    this.getMeetings_from_admin();

    
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

  public verifyUserConfirmation = () => {

    this._eventser.verifyUSer().subscribe((data) => {

      this.disconnectedSocket = false;

      this._eventser.setUser(this.M_P_AuthToken);

    });

  }

  public getOnlineUserList = () => {

    this._eventser.onlineUSerList().subscribe( (userList1) => {

          //alert(JSON.stringify(userList1));

          this.userList = [];

          for(let x in userList1)
          {
              let user = {userId:userList1[x]['userId'],userName : userList1[x]['fullname']};

              this.userList.push(user);

              console.log(this.userList);

          }

    });


  }

  public get_meetings = (sender_receiver_obj) => {

    this._eventser.meeting_list().subscribe( (userList1) => {


          for(let x_get_all_met in userList1)
          {
            if(userList1['x_get_all_met']['meeting_created_for'] == this.selected_userId)
            {
                this.events = [
                  ...this.events,
                  userList1['x_get_all_met']
                ];
            }
              

          }

    });

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

  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

 
  changeDate(date: Date): void {
    this.viewDate = date ;
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
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
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
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        }
      }
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  addEvent_form(){

    this.modal.open(this.modalContent_form, { size: 'lg' });

  }

  public created_by;
  public meeting_purpose;
  public meeting_place;
  public meeting_date;
  public created_for;

  create_meeting_form(){

    if(this.meeting_purpose === undefined || this.meeting_purpose === null || this.meeting_purpose === '')
    {
        this.toastr.warning("Please enter Metting Purpose")
    }
    else if(this.meeting_place === undefined || this.meeting_place === null || this.meeting_place === '')
    {
        this.toastr.warning("Please enter Meeting Place");
    }
    else if(this.meeting_date === undefined || this.meeting_date === null || this.meeting_date ==='')
    {
        this.toastr.warning("Please select Meeting Start date time and meeting end date time");
    }
    else
    {

        let meeting_dataObj = {
          meeting_created_by : this.UserId,
          meeting_purpose : this.meeting_purpose,
          meeting_place : this.meeting_place,
          meeting_start_date : this.meeting_date,
          meeting_created_for : this.selected_userId,
          createdOn: new Date()
        }

        this._eventser.Create_Mettting(meeting_dataObj);
        $(document).ready(function () {
          var button_create_meetng = document.getElementById("create_close_btn");
          button_create_meetng.click();
        });
        this.pushToEvents(meeting_dataObj);

    }

  }

  public pushToEvents = (meeting_dataObj) => {

    this.events = [
      ...this.events,
      {
        title: meeting_dataObj.meeting_purpose,
        start: new Date(meeting_dataObj.meeting_start_date),
        end: new Date(meeting_dataObj.meeting_start_date),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        }
      }
    ];

  }

  public getMeetings_from_admin = () => {

    alert();

    this._eventser.particular_user_meeting(this.selected_userId)
    .subscribe((data)=>{
        
          alert(data);
          this.events = [
            ...this.events,
            data
          ];
  
          console.log(this.events);
        
        
    });

  }
  
}
