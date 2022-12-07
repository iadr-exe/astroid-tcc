import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { UserDocument } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileResolver implements Resolve<UserDocument> {
  constructor(
    private _router: Router,
    private _profileService: ProfileService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<UserDocument> {
    return this._profileService.getUser(route.paramMap.get('id')).pipe(
      take(1),
      catchError((error) => {
        console.error(error);
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this._router.navigateByUrl(parentUrl);
        return throwError(error);
      })
    );
  }
}
