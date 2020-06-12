// @ts-nocheck

import { AuthActions } from '@example-app/auth/actions';
import { LayoutActions } from '@example-app/core/actions';
import { createReducer, on } from '@ngrx/store';

export const simpleFeatureKey = 'simpleFeature';

export interface State {
  showSidenav: boolean;
}

const initialState: State = {
  showSidenav: false,
};

export const reducer = createReducer(
  initialState,
  on(LayoutActions.closeSidenav, (_state) => ({ showSidenav: false })),
  on(LayoutActions.openSidenav, (_state) => ({ showSidenav: true })),
  on(AuthActions.logoutConfirmation, (_state) => ({ showSidenav: false }))
);
