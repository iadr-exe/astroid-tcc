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
import { CompaniesService } from './companies.service';

@Injectable({
  providedIn: 'root',
})
export class CompaniesResolver implements Resolve<UserDocument[]> {
  constructor(
    private _router: Router,
    private _companiesService: CompaniesService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<UserDocument[]> {
    return this._companiesService.getCompanies().pipe(
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
