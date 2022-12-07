import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LateralChatsComponent } from './lateral-chats.component';

describe('LateralChatsComponent', () => {
  let component: LateralChatsComponent;
  let fixture: ComponentFixture<LateralChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LateralChatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LateralChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
