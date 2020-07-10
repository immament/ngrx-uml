//@ts-expect-error
import { Credentials } from '@example-app/auth/models';
//@ts-expect-error
import { createAction, createReducer, on, props } from '@ngrx/store';

export const closeSidenav = createAction('[Layout] Close Sidenav',  props<{ credentials: Credentials }>());
export const openSidenav = createAction('[Layout] Open Sidenav');

export interface State {
  showSidenav: boolean;
}

const initialState: State = {
  showSidenav: false,
};

export const reducer = createReducer(
  initialState,
  on(closeSidenav, (_state) => ({ showSidenav: false })),
  on(openSidenav, (_state) => ({ showSidenav: true })),
  // on(AuthActions.logoutConfirmation, (_state) => ({ showSidenav: false }))
);
