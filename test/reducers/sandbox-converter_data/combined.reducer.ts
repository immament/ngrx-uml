// @ts-nocheck
import { Action, combineReducers } from '@ngrx/store';

import * as reducersFromCoach from './simple.reducer';

import * as stateFromCoach from './simple.reducer';

export const coachFeatureKey = 'keyFromReducerFile';

export interface CoachState {
    [stateFromCoach.simpleFeatureKey]: stateFromCoach.State;
}

export interface State {
    [coachFeatureKey]: CoachState;
}

export const reducers = (state: CoachState | undefined, action: Action) => {
    return combineReducers({
        [stateFromCoach.simpleFeatureKey]: reducersFromCoach.reducer
    })(state, action);
};
