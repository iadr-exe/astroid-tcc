import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserDocument } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  userData: UserDocument;
  loggedIn: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        console.debug(`User subscribe from navbar`, user);
        this.userData = user;
      });

    this._authService._auth.authState
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        if (!user) this.loggedIn = false;
        else this.loggedIn = true;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
