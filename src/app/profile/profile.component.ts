import { FollowService } from './../services/follow.service';
import { PostsService } from './../services/posts.service';
import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  displayName;
  userName;
  photoURL = '../../assets/images/default-profile.jpg';
  status;
  joinDate = 'May 2009';
  userid = null;
  bannerURL;
  userFollowers;
  userFollowing;

  currentuid;

  totalScribes;
  totalFollowers;
  totalFollowing;
  totalLikes = 23;

  posts: any;
  followers: any;
  following: any;
  likes: any;

  showInvalid: boolean;
  isLoaded: boolean;
  isCurrentUser: boolean;
  isLoggedIn: boolean;
  isFollowing: boolean;
  showPosts: boolean;
  showFollowers: boolean;
  showFollowing: boolean;
  showLikes: boolean;

  profileInfoClass = 'row justify-content-center ml-md-2 ml-lg-auto justify-content-lg-end';

  constructor(
    private router: Router,
    private userService: UserService,
    private postsService: PostsService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private auth: AuthService,
    private follow: FollowService
  ) { }

  ngOnInit() {
    this.showPosts = true;
    this.isLoggedIn = false;
    this.isLoaded = false;
    this.isFollowing = false;

    this.titleService.setTitle('Profile');
    this.userService.retrieveUserDocumentFromUsername(this.router.url.slice(6)).subscribe(
      user => {
        if (user[0]) {
          const uservar: any = user[0];
          this.displayName = uservar.displayName;
          this.userName = uservar.userName;
          this.status = uservar.status;
          this.photoURL = uservar.photoURL;
          this.userid = uservar.uid;
          this.isLoaded = true;
          this.titleService.setTitle(this.displayName + ' @' + this.userName);
          this.checkCurrentUser();
          this.getFollowData();
          this.postsService.getUserPosts(this.userid).subscribe(
            posts => {
              this.posts = posts;
              this.totalScribes = posts.length;
            });
        } else {
          this.isLoaded = true;
          this.showInvalid = true;
        }
    });
  }

  showTab(type) {
    if (type === 'posts') {
      this.showPosts = true;
      this.showFollowers = false;
      this.showFollowing = false;
      this.showLikes = false;
    }
    if (type === 'followers') {
      this.showPosts = false;
      this.showFollowers = true;
      this.showFollowing = false;
      this.showLikes = false;
    }
    if (type === 'following') {
      this.showPosts = false;
      this.showFollowers = false;
      this.showFollowing = true;
      this.showLikes = false;
    }
    if (type === 'likes') {
      this.showPosts = false;
      this.showFollowers = false;
      this.showFollowing = false;
      this.showLikes = true;
    }
  }

  getFollowData() {
    this.totalFollowers = 0;
    this.totalFollowing = 0;

    this.follow.getFollowers(this.userid).subscribe(
      followers => {
        this.followers = followers;
        this.totalFollowers = followers.length;
        this.userFollowers = followers;
      });
    this.follow.getFollowing(this.userid).subscribe(
      following => {
        this.following = following;
        this.totalFollowing = following.length;
        this.userFollowing = following;
      });
  }

  followUser() {
    if (this.isFollowing) {
      this.isFollowing = false;
      this.follow.unfollow(this.userid);
    } else {
      this.isFollowing = true;
      this.follow.follow(this.userid);
    }
  }

  checkFollowing() {
    if (this.isFollowing) {
      return 'Following';
    } else {
      return 'Follow';
    }
  }

  scrollHandler(event) {
    console.log(event);
  }
  checkCurrentUser() {
    this.auth.getAuthState().subscribe(
      user => {
        if (user) {
          if (this.userid) {
            this.isLoggedIn = true;
            this.currentuid = user.uid;
            if (this.userid === user.uid) {
              this.isCurrentUser = true;
              this.profileInfoClass = 'row justify-content-center ml-md-2 ml-lg-auto';
            }
            this.follow.isFollowing(this.userid, this.currentuid).subscribe(
              followinguser => {
                if (followinguser[0]) {
                  this.isFollowing = true;
                }
            });
          }
        } else {
          this.isLoggedIn = false;
          this.profileInfoClass = 'row justify-content-center ml-md-2 ml-lg-auto';
        }
    });
  }

  getStyle() {
    if (this.bannerURL) {
      return this.sanitizer.bypassSecurityTrustStyle(`background-image: url(${this.bannerURL})`);
    }
  }
}
