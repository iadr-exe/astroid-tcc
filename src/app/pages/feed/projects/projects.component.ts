import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Post, UserDocument } from 'src/app/app.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @Input() filter: string | undefined;
  posts: Post[] = [];
  userData: UserDocument;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _authService: AuthService,
    public _projectsService: ProjectsService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._authService.userData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        console.debug(`User subscribe from feed`, user);
        if (user && !user.emailVerified)
          this._router.navigate(['verify-email']);
        this.userData = user;
      });

    this._projectsService
      .getPosts(this.filter)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((posts) => {
        this.posts = [...this.posts, ...posts].sort(
          (a, b) => b.timestamp - a.timestamp
        );
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
