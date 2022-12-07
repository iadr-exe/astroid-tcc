import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { UserDocument, Chat, ChatMessage, ChatData } from 'src/app/app.types';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject(null);
  private _receiver: BehaviorSubject<UserDocument | null> = new BehaviorSubject(
    null
  );
  private _messsages: BehaviorSubject<ChatMessage[] | null> =
    new BehaviorSubject([]);

  constructor(private _firestore: AngularFirestore) {}

  get chat$(): Observable<Chat> {
    return this._chat.asObservable();
  }

  get messages$(): Observable<ChatMessage[]> {
    return this._messsages.asObservable();
  }

  get receiver$(): Observable<UserDocument> {
    return this._receiver.asObservable();
  }

  getReceiver(receiverUserId: string): Observable<UserDocument> {
    return this._firestore
      .doc<UserDocument>('Users/' + receiverUserId)
      .valueChanges()
      .pipe(
        tap((result: any) => {
          const user = {
            ...result,
            userId: receiverUserId,
          } as UserDocument;
          this._receiver.next(user);
          return user;
        })
      );
  }

  getUserChats(userId: string): Observable<ChatData[]> {
    return this._firestore
      .doc<UserDocument>('Users/' + userId)
      .collection('Chats')
      .valueChanges()
      .pipe(
        map((chats: any) => {
          return chats;
        })
      );
  }

  getChat(
    actualUserId: string,
    receiverUserId: string,
    chatId: string
  ): Observable<Chat> {
    return this._firestore
      .doc('Chats/' + chatId)
      .valueChanges()
      .pipe(
        tap((result: any) => {
          if (result) {
            this._chat.next(result);
          } else {
            const chatData = {
              chatId: chatId,
              members: [actualUserId, receiverUserId],
              name: 'self',
            };
            this._chat.next(chatData);
            this._firestore.collection(`Chats`).doc(`${chatId}`).set(chatData);
            const usersCollection = this._firestore.collection(`Users`);
            usersCollection
              .doc(`${actualUserId}`)
              .collection('Chats')
              .add({ userId: receiverUserId, name: 'self' });
            usersCollection
              .doc(`${receiverUserId}`)
              .collection('Chats')
              .add({ userId: actualUserId, name: 'self' });
          }
        })
      );
  }

  getMessages(chatId: string): Observable<ChatMessage[]> {
    console.debug(`Get Messages Service for chat Id: `, chatId);
    return this._firestore
      .collection('Chats/' + chatId + '/Messages')
      .stateChanges()
      .pipe(
        map((messages: any) => {
          const result = messages
            .filter((x) => x.type === 'added')
            .map((a) => {
              return {
                messageId: a.payload.doc.id,
                ...(a.payload.doc.data() as object),
              } as ChatMessage;
            })
            .sort((a, b) => a.timestamp - b.timestamp);
          console.log(messages);
          this._messsages.next(result);
          return result;
        })
      );
  }
}
