import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticularUserEventComponent } from './particular-user-event.component';

describe('ParticularUserEventComponent', () => {
  let component: ParticularUserEventComponent;
  let fixture: ComponentFixture<ParticularUserEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticularUserEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticularUserEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
