// @ts-nocheck

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { CoachPage } from './coach-page/coach.page';
import { CoachRoutingModule } from './coach-routing.module';
import * as fromCoach from './coach.reducer';
import * as fromSimpleReducer from './simple.reducer';
import { CoachEffects } from './store/effects/coach.effects';
import { TeamSelectionComponent } from './team-selection/team-selection.component';

const fromCoachProp = {
  coachFeatureKey = 'keyFromProperty',
  reducer =  createReducer(
    initialState,
    on(LayoutActions.closeSidenav, (_state) => ({ showSidenav: false })),
    on(LayoutActions.openSidenav, (_state) => ({ showSidenav: true })),
    on(AuthActions.logoutConfirmation, (_state) => ({ showSidenav: false }))
  )
};
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    CoachRoutingModule,
    StoreModule.forFeature('keyFromString', fromSimpleReducer.reducer),
    StoreModule.forFeature(fromCoachProp.coachFeatureKey, fromCoachProp.reducer),
    StoreModule.forFeature(fromCoach.coachFeatureKey, fromCoach.reducers),
    EffectsModule.forFeature([CoachEffects])
  ],
  declarations: [
    CoachPage,
    TeamSelectionComponent
  ]
})
export class CoachPageModule { }
