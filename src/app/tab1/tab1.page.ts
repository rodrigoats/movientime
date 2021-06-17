import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  loading: any;
  isGoogleLogin = false;
  user = null;

  constructor(
    public loadingController: LoadingController,
    private google: GooglePlus,
    private fireAuth: AngularFireAuth,
    private platform: Platform) { }

  async ngOnInit() {
    this.loading = await this.loadingController.create({
      message: 'Connecting...'
    });

    this.platform.ready().then(() => {
      this.fireAuth.onAuthStateChanged(user => {
        if (user) {
          this.isGoogleLogin = true;
        }
        else {
          this.isGoogleLogin = false;
        }
      });
    });
  }

  doLogin() {
    let params: any;
    if (this.platform.is('cordova')) {
      if (this.platform.is('android')) {
        params = {
          webClientId: '1:491656154934:web:067a32d62c2bd0ffb5ad97',
          offline: true,
        };
      } else {
        params = {};
      }

      this.google.login(params).then((response) => {
        const { idToken, accessToken } = response;
        this.onLoginSuccess(idToken, accessToken);
      }).catch((error) => {
        console.log(error);
        alert('Error: ' + JSON.stringify(error));
      });
    } else {
      console.log('else...');
      this.fireAuth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider()).then(success => {
        console.log('success in google login', success);
        this.isGoogleLogin = true;
        this.user =  success.user;
      }).catch(err => {
        console.log(err.message, 'error in google login');
      });
    }
  }

  onLoginSuccess(accessToken, accessSecret) {
    const credential = accessSecret ?
      firebase.default.auth.GoogleAuthProvider.credential(accessToken, accessSecret) :
      firebase.default.auth.GoogleAuthProvider.credential(accessToken);

    this.fireAuth.signInWithCredential(credential)
      .then((success) => {
        this.isGoogleLogin = true;
        this.user = success.user;
        this.loading.dismiss();
      });
  }

  onLoginError(err) {
    console.log(err);
  }

  logout() {
    this.fireAuth.signOut().then(() => {
      this.isGoogleLogin = false;
    });
  }
}
