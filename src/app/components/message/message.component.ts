import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { UserDocument, ChatMessage } from '../../app.types';
import { Comment } from '../post-reply/post-reply.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() commentData: Comment | ChatMessage;
  @Input() isCreator: boolean;
  creator: { name: string; avatar: string };
  comment: Comment | ChatMessage;

  constructor(
    private _firestore: AngularFirestore,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAuthor();
  }

  getAuthor() {
    this._firestore
      .doc<UserDocument>('Users/' + this.commentData.authorId)
      .snapshotChanges()
      .pipe(
        map((changes) => {
          const data = changes.payload.data();
          if (!data) return null;
          return {
            name:
              data.companyAccount === '0'
                ? data.firstName + ' ' + data.lastName
                : data.companyName,
            avatar: data.avatar,
          };
        })
      )
      .subscribe((result) => {
        if (result) {
          this.comment = {
            ...this.commentData,
            date: new Date(this.commentData.timestamp).toLocaleString(),
            author: result,
          };
          this._changeDetectorRef.markForCheck();
        }
      });
  }
}
