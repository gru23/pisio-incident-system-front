import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentDetectionComponent } from './incident-detection.component';

describe('IncidentDetectionComponent', () => {
  let component: IncidentDetectionComponent;
  let fixture: ComponentFixture<IncidentDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
