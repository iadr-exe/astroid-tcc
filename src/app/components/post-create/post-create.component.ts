import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserDocument } from 'src/app/app.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  @Input() postType: number = 0;
  @Input() showPostTypeToggle: boolean;
  selectedImageFile: File;
  creatingPost: boolean = false;
  userData: UserDocument;
  today: Date = new Date();
  posting: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _authService: AuthService,
    private _firestore: AngularFirestore,
    private _firestorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        console.debug(`User subscribe from post-create`, user);
        this.userData = user;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  toggleCreating(): void {
    this.creatingPost = !this.creatingPost;
  }

  onPostClick(event: any, comment: string): void {
    event.preventDefault();
    if (!comment.length) return;
    this.uploadPost(comment);
  }

  onProjectClick(
    event: any,
    description: string,
    date: string,
    tel: string,
    email: string
  ): void {
    event.preventDefault();
    if (!description.length || !date || !tel || !email) return;
    this.uploadProject(description, date, tel, email);
  }

  async uploadPost(comment: string): Promise<void> {
    this.posting = true;
    const postId = this._firestore.createId();
    let imageUrl = null;
    this.removeImagePreview();
    if (this.selectedImageFile) {
      imageUrl = await this._firestorage
        .upload(`Posts/${postId}/Image`, this.selectedImageFile)
        .then(async (snapshot) => {
          const donwloadUrl = await snapshot.ref.getDownloadURL();
          return donwloadUrl;
        });
    }

    await this._firestore
      .collection(`Posts`)
      .doc(`${postId}`)
      .set({
        creatorId: this.userData.userId,
        timestamp: Date.now(),
        type: 1,
        post: { comment: comment, imageUrl: imageUrl },
        project: null,
      });
    this.creatingPost = false;
    this.posting = false;
  }

  async uploadProject(
    description: string,
    date: string,
    tel: string,
    email: string
  ): Promise<void> {
    this.posting = true;
    const postId = this._firestore.createId();
    let imageUrl = null;
    if (this.selectedImageFile) {
      imageUrl = await this._firestorage
        .upload(`Posts/${postId}/Image`, this.selectedImageFile)
        .then(async (snapshot) => {
          const downloadUrl = await snapshot.ref.getDownloadURL();
          return downloadUrl;
        });
    }

    await this._firestore
      .collection(`Posts`)
      .doc(`${postId}`)
      .set({
        creatorId: this.userData.userId,
        timestamp: Date.now(),
        type: 2,
        post: null,
        project: {
          description: description,
          endDate: date,
          tel: tel,
          email: email,
          imageUrl: imageUrl,
        },
      });
    this.creatingPost = false;
    this.posting = false;
  }

  onPhotoSelected(photoSelector: HTMLInputElement): void {
    this.selectedImageFile = photoSelector.files[0];
    if (!this.selectedImageFile) return;
    let reader = new FileReader();
    reader.readAsDataURL(this.selectedImageFile);
    reader.addEventListener('loadend', (ev) => {
      let base64File = reader.result.toString();
      let photoPreview = document.getElementById(
        'post-preview-image'
      ) as HTMLImageElement;
      photoPreview.src = base64File;
    });
  }

  removeImagePreview(): void {
    let photoPreview = document.getElementById(
      'post-preview'
    ) as HTMLDivElement;
    if (photoPreview) {
      photoPreview.innerHTML = '<img id="post-preview-image" />';
    }
  }

  togglePostType(event: Event): void {
    this.postType = Number((<HTMLInputElement>event.target).checked);
  }
}
