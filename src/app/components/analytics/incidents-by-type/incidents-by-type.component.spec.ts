import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsByTypeComponent } from './incidents-by-type.component';

describe('IncidentsByTypeComponent', () => {
  let component: IncidentsByTypeComponent;
  let fixture: ComponentFixture<IncidentsByTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsByTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
