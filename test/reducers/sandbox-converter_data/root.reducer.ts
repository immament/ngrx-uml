// @ts-nocheck

import { InjectionToken } from '@angular/core';
import * as fromRouter from '@ngrx/router-store';
import { Action, ActionReducerMap } from '@ngrx/store';

import * as fromLayout from './simple.reducer';

export interface State {
    [fromLayout.simpleFeatureKey]: fromLayout.State;
    router: fromRouter.RouterReducerState<any>;
}

export const ROOT_REDUCERS = new InjectionToken<ActionReducerMap<State, Action>>(
    'Root reducers token',
    {
        factory: () => ({
            [fromLayout.simpleFeatureKey]: fromLayout.reducer,
            router: fromRouter.routerReducer,
        }),
    }
);

