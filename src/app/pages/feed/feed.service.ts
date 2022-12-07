import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Post } from '../../app.types';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private _posts: BehaviorSubject<Post[] | null> = new BehaviorSubject(null);

  constructor(private _firestore: AngularFirestore) {}

  get posts$(): Observable<Post[]> {
    return this._posts.asObservable();
  }

  getPosts(userId: string | undefined): Observable<Post[]> {
    return this._firestore
      .collection('Posts', (ref) =>
        userId
          ? ref
              .orderBy('timestamp', 'desc')
              .where('project', '==', null)
              .where('creatorId', '==', userId)
          : ref.orderBy('timestamp', 'desc').where('project', '==', null)
      )
      .stateChanges()
      .pipe(
        map((posts: any) => {
          const result = posts
            .filter((x) => x.type === 'added')
            .map((a) => {
              return {
                postId: a.payload.doc.id,
                ...(a.payload.doc.data() as object),
              } as Post;
            })
            .sort((a, b) => a.timestamp - b.timestamp);

          this._posts.next(result);
          return result;
        })
      );
  }
}
