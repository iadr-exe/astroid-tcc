import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserDocument } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserDocument;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _authService: AuthService,
    private _profileService: ProfileService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._authService._auth.authState
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_user) => {
        if (_user) {
          this._profileService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: UserDocument) => {
              this.user = {
                ...user,
                canEditProfile: _user.uid === user.userId,
                canSendMessage: _user.uid !== user.userId,
              };

              this._changeDetectorRef.markForCheck();
            });
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
