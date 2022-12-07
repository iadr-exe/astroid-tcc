import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  UserDocument,
  Chat,
  ChatMessage,
  MessageAttachment,
  ChatData,
} from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private scrollElement: ElementRef;
  chats: ChatData[] = [];
  chat: Chat = {
    chatId: '',
    members: [],
  };
  receiver: UserDocument;
  loading: boolean = true;
  sender: UserDocument;
  attachments: File[] = [];
  scrolledToBottom: boolean = false;
  messages: ChatMessage[] = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _firestore: AngularFirestore,
    private _firestorage: AngularFireStorage,
    private _route: ActivatedRoute,
    private _authService: AuthService,
    private _chatService: ChatService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        if (user) {
          this._chatService
            .getUserChats(user.userId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chats) => {
              this.chats = chats;
            });
          this.sender = user;
          this._route.paramMap.subscribe((params) => {
            this._chatService
              .getReceiver(params.get('chat'))
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((receiver: UserDocument) => {
                this.receiver = receiver;
                this.loading = false;
                this._changeDetectorRef.markForCheck();
              });

            this.chat.chatId = String(
              Number(user.userId.replace(/\D/g, '')) +
                Number(params.get('chat').replace(/\D/g, ''))
            );

            this._chatService
              .getMessages(this.chat.chatId)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((messages) => {
                if (messages.length > 0) {
                  this.messages = [...this.messages, ...messages];
                  if (
                    this.scrollElement &&
                    this.scrollElement.nativeElement.scrollTop ===
                      this.scrollElement.nativeElement.scrollHeight
                  ) {
                    this.scrolledToBottom = false;
                  }
                  this._changeDetectorRef.markForCheck();
                }
              });
            this._chatService
              .getChat(user.userId, params.get('chat'), this.chat.chatId)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((chat: Chat) => {
                this.chat = {
                  ...chat,
                  name:
                    this.receiver.companyAccount === '0'
                      ? this.receiver.firstName + ' ' + this.receiver.lastName
                      : this.receiver.companyName,
                  icon: this.receiver.avatar,
                  ...this.chat,
                };
                this._changeDetectorRef.markForCheck();
              });
          });
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

  onScroll(): void {
    this.scrolledToBottom = true;
  }

  isMessageAuthor(message: ChatMessage): boolean {
    try {
      return message.authorId == this.sender.userId;
    } catch (err) {}
  }

  photoUpload(photo: HTMLInputElement) {
    if (photo.files?.length > 0) {
      const reader = new FileReader();
      const file = photo.files[0];
      reader.readAsDataURL(file);
      reader.addEventListener('loadend', () => {
        const base64File = reader.result.toString();
        this.attachments.push(file);
        const photoPreview = document.getElementById(
          'photoPreview'
        ) as HTMLImageElement;
        photoPreview.style.display = 'block';
        photoPreview.src = base64File;
      });
    }
  }

  async sendMessage(event: any, textarea: HTMLTextAreaElement) {
    event.preventDefault();
    const attachments = [];
    const messageId = this._firestore.createId();
    if (this.attachments && this.attachments.length > 0) {
      for await (const attachment of this.attachments as File[]) {
        await this._firestorage
          .upload(
            `Messages/${messageId}/ ${attachment.name}-${new Date()
              .toLocaleString()
              .replace(/[\/:]/g, '')
              .replace(/ /, '-')}`,
            attachment
          )
          .then(async (snapshot) => {
            await snapshot.ref.getDownloadURL().then((downloadUrl) => {
              attachments.push({
                type: attachment.type,
                url: downloadUrl,
                name: attachment.name,
                timestamp: Date.now(),
                lastModified: attachment.lastModified,
                size: attachment.size,
              });
            });
          });
      }
    }
    const newMessage = <ChatMessage>{
      messageId: messageId,
      authorId: this.sender.userId,
      content: textarea.value.toString(),
      attachments: <MessageAttachment[]>attachments,
      timestamp: Date.now(),
    };
    this.scrolledToBottom = false;
    this._firestore
      .collection(`Chats`)
      .doc(`${this.chat.chatId}`)
      .collection('Messages')
      .add(newMessage);
    const photoPreview = document.getElementById(
      'photoPreview'
    ) as HTMLImageElement;
    photoPreview.style.display = 'none';
    photoPreview.src = '';
    textarea.value = '';
    this.attachments = [];
  }
}
