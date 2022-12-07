import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from 'src/app/app.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private _posts: BehaviorSubject<Post[] | null> = new BehaviorSubject(null);

  constructor(private _firestore: AngularFirestore) {}

  get posts$(): Observable<Post[]> {
    return this._posts.asObservable();
  }

  getPosts(userId: string | undefined): Observable<Post[]> {
    return from(
      this._firestore
        .collection('Posts', (ref) =>
          userId
            ? ref
                .orderBy('timestamp', 'desc')
                .where('post', '==', null)
                .where('creatorId', '==', userId)
            : ref.orderBy('timestamp', 'desc').where('post', '==', null)
        )
        .stateChanges()
    ).pipe(
      map((posts: any) => {
        const result = posts
          .filter((x) => x.type === 'added')
          .map((a) => {
            return {
              postId: a.payload.doc.id,
              ...(a.payload.doc.data() as object),
            } as Post;
          });

        this._posts.next(result);
        return result;
      })
    );
  }
}
