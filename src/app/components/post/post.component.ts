import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Post, UserDocument } from '../../app.types';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  @Input() postData: Post;
  post: Post;

  constructor(
    public _firestore: AngularFirestore,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._firestore
      .doc<UserDocument>('Users/' + this.postData.creatorId)
      .snapshotChanges()
      .pipe(
        map((changes) => {
          const data = changes.payload.data();
          if (!data) return null;
          console.log(data);
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
          this.post = {
            ...this.postData,
            date: new Date(this.postData.timestamp).toLocaleString(),
            creator: result,
          };
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  getFormatedDate(value: string): string {
    const inputDate = new Date(value);
    const diff = Math.abs(Date.now() - inputDate.getTime());
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.floor(diff / (1000 * 60 * 60) - daysDiff * 24);
    const minutesDiff = Math.floor(
      diff / (1000 * 60) - daysDiff * 24 * 60 - hoursDiff * 60
    );
    return `${inputDate.toLocaleString()} (Ends in ${daysDiff} days, ${hoursDiff} hours e ${minutesDiff} minutes)`;
  }
}
