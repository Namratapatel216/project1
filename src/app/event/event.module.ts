import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';

import { UserEventComponent } from './user-event/user-event.component';

import { AdminEventComponent } from './admin-event/admin-event.component';

import { FormsModule } from '@angular/forms';

import { BsDatepickerModule} from 'ngx-bootstrap/datepicker';

import { TimepickerModule } from 'ngx-bootstrap/timepicker';


import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { DateTimePickerModule} from 'ngx-datetime-picker';


import { ParticularUserEventComponent } from './particular-user-event/particular-user-event.component';
import { CalendarHeaderComponent } from '../demo-utils/calendar-header.component';
import { DemoUtilsModule } from '../demo-utils/module';

@NgModule({
  declarations: [UserEventComponent, AdminEventComponent, ParticularUserEventComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoUtilsModule,
    DateTimePickerModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    RouterModule.forChild([
      {path:'Uevent',component:UserEventComponent},
      {path:'Aevent',component:AdminEventComponent},
      {path:'per-user/:userId',component:ParticularUserEventComponent}
    ])
  ],
  exports: [ParticularUserEventComponent,CalendarHeaderComponent]
})
export class EventModule { }
