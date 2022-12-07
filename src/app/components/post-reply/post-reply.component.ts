import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { UserDocument } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-post-reply',
  templateUrl: './post-reply.component.html',
  styleUrls: ['./post-reply.component.scss'],
})
export class PostReplyComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('replyContainer') private scrollElement: ElementRef;
  @Input() postId: string;
  comments: Comment[] = [];
  replying: boolean;
  scrolledToBottom: boolean;
  userData: UserDocument;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _authService: AuthService,
    private _firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.replying = false;
    this.comments = [];
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        console.debug(`User subscribe from post-reply`, user);
        this.userData = user;
      });

    this.getComments()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result) => {
        if (
          this.scrollElement &&
          this.scrollElement.nativeElement.scrollTop ===
            this.scrollElement.nativeElement.scrollHeight
        ) {
          this.scrolledToBottom = false;
          this.comments = [...this.comments, ...result];
        } else {
          this.comments = [...this.comments, ...result];
        }
      });
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const nativeElement = this.scrollElement.nativeElement;
      if (!this.scrolledToBottom)
        nativeElement.scrollTop = nativeElement.scrollHeight;
    } catch (err) {}
  }

  onScroll() {
    this.scrolledToBottom = true;
  }

  isCommentCreator(comment: Comment): boolean {
    try {
      return comment.authorId == this.userData.userId;
    } catch (err) {}
  }

  toggleReplying(): void {
    this.replying = !this.replying;
  }

  getComments(): Observable<Comment[]> {
    return from(
      this._firestore
        .collection(`Posts/${this.postId}/PostComments`)
        .stateChanges()
    ).pipe(
      map((posts: any) => {
        return posts
          .filter((x) => x.type === 'added')
          .map((x) => x.payload.doc.data())
          .sort((a, b) => a.timestamp - b.timestamp);
      })
    );
  }

  onSendClick(event: any, commentInput: HTMLTextAreaElement): void {
    event.preventDefault();

    const comment = <Comment>{
      commentId: Math.random().toString(36).slice(3),
      authorId: this.userData.userId,
      content: commentInput.value,
      attachments: [],
      timestamp: Date.now(),
    };

    commentInput.value = '';
    this.scrolledToBottom = false;

    this._firestore
      .collection(`Posts/${this.postId}/PostComments`)
      .add(comment);
  }
}

export interface Comment {
  commentId: string;
  authorId: string;
  author?: {
    name: string;
    avatar: string;
  };
  content: string;
  attachments: CommentAttachment[];
  timestamp: number;
  date?: string;
}

export interface CommentAttachment {
  type: string;
  url: string;
  name: string;
  timestamp: number;
  lastModified: number;
  size: number;
}
