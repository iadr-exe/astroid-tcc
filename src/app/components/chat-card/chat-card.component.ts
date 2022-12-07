import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ChatData, UserDocument } from 'src/app/app.types';

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html',
  styleUrls: ['./chat-card.component.scss'],
})
export class ChatCardComponent implements OnInit, OnDestroy {
  @Input() chatData: ChatData;
  chatMember: UserDocument;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(private _firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.getUser(this.chatData.userId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: UserDocument) => {
        this.chatMember = user;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  getUser(userId: string): Observable<UserDocument> {
    return this._firestore
      .doc<UserDocument>('Users/' + userId)
      .valueChanges()
      .pipe(
        tap((result: any) => {
          const user = {
            ...result,
            userId: userId,
          } as UserDocument;
          return user;
        })
      );
  }
}
