import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import { AppState } from '../app.reducer';
import { Usuario } from '../models/usuario.model';
import * as authActions from '../auth/auth.actions';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso-actions';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userSubscription?: Subscription;
  private _user?: Usuario;

  get user() {
    return { ...this._user };
  }

  constructor(
    private auth: AngularFireAuth,
    public firestore: AngularFirestore,
    private store: Store<AppState>
  ) {}

  initAuthListener() {
    this.auth.authState.subscribe((fuser) => {
      if (fuser) {
        //Existe
        this.userSubscription = this.firestore
          .doc(`${fuser.uid}/usuario`)
          .valueChanges()
          .subscribe((firestoreUser: any) => {
            const user = Usuario.fromFirebase(firestoreUser);
            this._user = user;
            this.store.dispatch(authActions.setUser({ user }));
          });
      } else {
        //No existe
        this._user = undefined;
        this.userSubscription?.unsubscribe();
        this.store.dispatch(authActions.unSetUser());
        this.store.dispatch(ingresoEgresoActions.unSetItems());
      }
    });
  }

  crearUsuario(nombre: string, correo: string, password: string) {
    return this.auth
      .createUserWithEmailAndPassword(correo, password)
      .then(({ user }) => {
        const newUser = new Usuario(user!.uid, nombre, correo);
        return this.firestore.doc(`${user?.uid}/usuario`).set({ ...newUser });
      });
  }

  loginUsuario(correo: string, password: string) {
    return this.auth.signInWithEmailAndPassword(correo, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return this.auth.authState.pipe(map((fbUser) => fbUser != null));
  }
}
