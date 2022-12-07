import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserDocument } from 'src/app/app.types';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _users: BehaviorSubject<UserDocument[] | null> = new BehaviorSubject(
    null
  );

  constructor(private _firestore: AngularFirestore) {}

  get users$(): Observable<UserDocument[]> {
    return this._users.asObservable();
  }

  getUsers(): Observable<UserDocument[]> {
    return this._firestore
      .collection('Users', (ref) => ref.where('companyAccount', '==', '0'))
      .stateChanges()
      .pipe(
        map((posts: any) => {
          const result = posts
            .filter((x) => x.type === 'added')
            .map((a) => {
              return {
                userId: a.payload.doc.id,
                ...(a.payload.doc.data() as object),
              } as UserDocument;
            });

          this._users.next(result);
          return result;
        })
      );
  }
}
