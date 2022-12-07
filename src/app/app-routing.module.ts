import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';

import { FeedComponent } from './pages/feed/feed.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileResolver } from './pages/profile/profile.resolver';
import { EditProfileComponent } from './pages/profile/edit-profile/edit-profile.component';
import {
  AngularFireAuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ProjectsComponent } from './pages/feed/projects/projects.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { UsersComponent } from './pages/users/users.component';
import { UsersResolver } from './pages/users/users.resolver';
import { CompaniesComponent } from './pages/companies/companies.component';
import { CompaniesResolver } from './pages/companies/companies.resolver';

const redirectToLogin = () => redirectUnauthorizedTo(['login']);
const redirectToNormal = () => redirectLoggedInTo(['feed']);

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    data: { authGuardPipe: redirectToNormal },
    component: LoginComponent,
  },
  {
    path: 'register',
    data: { authGuardPipe: redirectToNormal },
    component: RegisterComponent,
  },
  {
    path: 'forgot-password',
    data: { authGuardPipe: redirectToNormal },
    component: ForgotPasswordComponent,
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
  },
  {
    path: 'feed',
    children: [
      {
        path: '',
        component: FeedComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectToLogin },
      },
      {
        path: 'projects',
        component: ProjectsComponent,
        canActivate: [AngularFireAuthGuard],
        data: {
          authGuardPipe: redirectToLogin,
        },
      },
    ],
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectToLogin,
    },
    resolve: {
      users: UsersResolver,
    },
  },
  {
    path: 'companies',
    component: CompaniesComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectToLogin,
    },
    resolve: {
      companies: CompaniesResolver,
    },
  },
  {
    path: 'chats',
    component: ChatsComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectToLogin,
    },
  },
  {
    path: 'chat/:chat',
    component: ChatComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectToLogin,
    },
  },
  {
    path: 'profile',
    children: [
      {
        path: 'edit',
        component: EditProfileComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectToLogin },
      },
      {
        path: ':id',
        component: ProfileComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectToLogin },
        resolve: {
          user: ProfileResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
