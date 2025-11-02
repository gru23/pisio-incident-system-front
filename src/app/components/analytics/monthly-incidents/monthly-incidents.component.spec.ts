import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyIncidentsComponent } from './monthly-incidents.component';

describe('MonthlyIncidentsComponent', () => {
  let component: MonthlyIncidentsComponent;
  let fixture: ComponentFixture<MonthlyIncidentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyIncidentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyIncidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
