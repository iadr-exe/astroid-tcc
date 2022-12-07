import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UserDocument, ChatData } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-lateral-chats',
  templateUrl: './lateral-chats.component.html',
  styleUrls: ['./lateral-chats.component.scss'],
})
export class LateralChatsComponent implements OnInit {
  chats: ChatData[] = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        console.debug(`User subscribe from lateral-chats`, user);
        if (user) {
          this.getUserChats(user.userId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chats) => {
              this.chats = chats;
            });
        }
      });
  }

  getUserChats(userId: string): Observable<ChatData[]> {
    return from(
      this._firestore
        .doc<UserDocument>('Users/' + userId)
        .collection('Chats')
        .valueChanges()
    ).pipe(
      map((chats: any) => {
        return chats;
      })
    );
  }
}
