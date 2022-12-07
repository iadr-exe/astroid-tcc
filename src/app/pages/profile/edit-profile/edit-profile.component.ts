import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CountriesAndStates, States, UserDocument } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
  userData: UserDocument = {
    userId: '',
    avatar: '',
    biography: '',
    country: '',
    state: '',
    province: '',
    firstName: '',
    gender: '',
    lastName: '',
    companyAccount: '0',
    companyName: '',
    lastSeen: 0,
  };
  selectedImageFile: File;
  cs: CountriesAndStates[] = [];
  actualStates: States[] = [];
  actualCities: string[] = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    public _authService: AuthService,
    private _firestore: AngularFirestore,
    private _firestorage: AngularFireStorage,
    private _router: Router,
    private _httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        console.debug(`User subscribe from edit-profile`, user);
        if (user && !user.emailVerified)
          return this._router.navigate(['verify-email']);
        this.userData = user;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  changeUserData(
    value: string | HTMLInputElement,
    path: string,
    isImage: boolean
  ) {
    if (isImage && value instanceof HTMLInputElement) {
      this.selectedImageFile = value.files[0];
      if (!this.selectedImageFile) return;
      let fileReader = new FileReader();
      fileReader.readAsDataURL(this.selectedImageFile);
      fileReader.addEventListener('loadend', () => {
        const userImageElement = document.getElementById(
          `${path}Preview`
        ) as HTMLImageElement;
        userImageElement.src = fileReader.result.toString();
        this.userData[path] = fileReader.result.toString();
      });
    } else {
      this.userData[path] = value;
    }
  }
  async submitProfile(event: any) {
    event.preventDefault();

    let img = this.selectedImageFile;

    if (!img) {
      await fetch(`${window.location.origin}/assets/defaultAvatar.png`)
        .then((res) => res.blob())
        .then((res) => (img = new File([res], 'ola.png', { type: res.type })));
    }

    this._firestorage
      .upload(`Users/${this.userData.userId}/Avatar`, img)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadUrl) => {
          this._firestore
            .collection(`Users`)
            .doc(`${this.userData.userId}`)
            .set({
              avatar: downloadUrl,
              biography: this.userData.biography,
              firstName: this.userData.firstName || '',
              lastName: this.userData.lastName || '',
              gender: this.userData.gender || '',
              companyAccount: this.userData.companyAccount,
              companyName: this.userData.companyName || '',
              country: this.userData.country,
              state: this.userData.country,
              province: this.userData.country,
              lastSeen: 1,
            });
        });
      });
  }

  toggleAccountType(event: Event): void {
    this.userData.companyAccount = (<HTMLInputElement>event.target).checked
      ? '1'
      : '0';
  }

  changeCountry(countryName: string): void {
    this.userData.country = countryName;
    this.actualCities = [];
    this.userData.state = '';
    this.actualStates = this.cs.find((x) => x.name === countryName).states;
  }

  changeState(stateName: string): void {
    this.userData.state = stateName;
    this.actualCities = [];
    this._httpClient
      .post('https://countriesnow.space/api/v0.1/countries/state/cities', {
        country: this.userData.country,
        state: stateName,
      })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result: { data: string[] }) => {
        this.actualCities = result.data;
      });
  }
}
