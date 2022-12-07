import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserDocument } from 'src/app/app.types';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _user: BehaviorSubject<UserDocument | null> = new BehaviorSubject(
    null
  );

  constructor(private _firestore: AngularFirestore) {}

  get user$(): Observable<UserDocument> {
    return this._user.asObservable();
  }

  getUser(id: string): Observable<UserDocument> {
    const usersDocuments = this._firestore.doc<UserDocument>('Users/' + id);
    return usersDocuments.snapshotChanges().pipe(
      tap((result: any) => {
        this._user.next({
          ...result.payload.data(),
          userId: id,
        } as UserDocument);
      })
    );
  }
}
