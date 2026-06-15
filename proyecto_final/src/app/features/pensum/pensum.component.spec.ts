import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensumComponent } from './pensum.component';

describe('PensumComponent', () => {
  let component: PensumComponent;
  let fixture: ComponentFixture<PensumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
