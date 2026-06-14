import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  const dialogRef = { close: jasmine.createSpy('close') };

  beforeEach(async () => {
    dialogRef.close.calls.reset();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Delete entry?', message: 'Sure?', confirmText: 'Delete' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
  });

  it('closes with true when confirm is clicked', () => {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.confirm-btn')!.click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('closes with false when cancel is clicked', () => {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cancel-btn')!.click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
