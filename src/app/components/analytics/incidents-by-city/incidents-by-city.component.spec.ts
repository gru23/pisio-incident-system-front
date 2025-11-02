import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsByCityComponent } from './incidents-by-city.component';

describe('IncidentsByCityComponent', () => {
  let component: IncidentsByCityComponent;
  let fixture: ComponentFixture<IncidentsByCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsByCityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsByCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
