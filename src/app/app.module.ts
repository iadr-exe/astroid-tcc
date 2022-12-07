import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import 'bootstrap';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MessageComponent } from './components/message/message.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PostCreateComponent } from './components/post-create/post-create.component';
import { PostReplyComponent } from './components/post-reply/post-reply.component';
import { PostComponent } from './components/post/post.component';
import { EditProfileComponent } from './pages/profile/edit-profile/edit-profile.component';
import { FeedComponent } from './pages/feed/feed.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { AuthService } from './shared/services/auth.service';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { ChatCardComponent } from './components/chat-card/chat-card.component';
import { HttpClientModule } from '@angular/common/http';
import { ProjectsComponent } from './pages/feed/projects/projects.component';
import { UsersComponent } from './pages/users/users.component';
import { LateralChatsComponent } from './components/lateral-chats/lateral-chats.component';
import { CompaniesComponent } from './pages/companies/companies.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    NavbarComponent,
    FeedComponent,
    PostComponent,
    PostReplyComponent,
    MessageComponent,
    ProfileComponent,
    EditProfileComponent,
    PostCreateComponent,
    HomeComponent,
    ChatComponent,
    ChatsComponent,
    ChatCardComponent,
    ProjectsComponent,
    UsersComponent,
    LateralChatsComponent,
    CompaniesComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    NgxMaskModule.forRoot(),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    RouterModule,
    AppRoutingModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
