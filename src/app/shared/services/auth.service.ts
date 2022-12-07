import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UserDocument } from 'src/app/app.types';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _userData: BehaviorSubject<UserDocument | null> = new BehaviorSubject(
    null
  );

  get userData$(): Observable<UserDocument> {
    return this._userData.asObservable();
  }

  constructor(
    public _firestore: AngularFirestore,
    public _auth: AngularFireAuth,
    public _router: Router,
    public _ngZone: NgZone
  ) {
    this._auth.authState
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        if (user) {
          this.getUser(user)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
              this._userData.next(user);
            });
        }
      });
  }

  get isLoggedIn(): boolean {
    return this._auth.authState !== null;
  }

  signIn(email: string, password: string) {
    return this._auth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this._ngZone.run(() => {
          this._router.navigate(['feed']);
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  signUp(email: string, password: string) {
    return this._auth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.sendVerificationMail();
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  sendVerificationMail() {
    return this._auth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this._router.navigate(['verify-email-address']);
      });
  }

  forgotPassword(passwordResetEmail: string) {
    return this._auth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  authLogin(provider: any) {
    return this._auth
      .signInWithPopup(provider)
      .then((result) => {
        this._ngZone.run(() => {
          this._router.navigate(['feed']);
        });
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  signOut() {
    return this._auth.signOut().then(() => {
      this._router.navigate(['login']);
    });
  }

  getUser(user: User): Observable<UserDocument> {
    return this._firestore
      .doc<UserDocument>('Users/' + user.uid)
      .snapshotChanges()
      .pipe(
        map((changes) => {
          const data = changes.payload.data();
          const userId = changes.payload.id;
          return {
            userId,
            email: user.email,
            emailVerified: user.emailVerified,
            ...data,
            accountCreated: changes.payload.exists,
          };
        })
      );
  }
}
