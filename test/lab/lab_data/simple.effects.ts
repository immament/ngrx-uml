// @ts-nocheck
import { asyncScheduler, EMPTY as empty, of } from 'rxjs';
import { catchError, debounceTime, map, skip, switchMap, takeUntil } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { Book } from '@example-app/books/models';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createAction } from '@ngrx/store';

export const closeSidenav = createAction('[Layout] Close Sidenav',props<{ credentials: Credentials }>());
export const openSidenav = createAction('[Layout] Open Sidenav');
export const searchFailure = createAction('[Books/API] Search Failure',props<{ errorMsg: string }>());
export const searchSuccess = createAction(
    '[Books/API] Search Success',
    props<{ books: Book[] }>()
);

@Injectable()
export class BookEffects {
    search$ = createEffect(
        () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
            this.actions$.pipe(
                ofType(openSidenav),
                debounceTime(debounce, scheduler),
                switchMap(({ query }) => {
                    if (query === '') {
                        return empty;
                    }

                    const nextSearch$ = this.actions$.pipe(
                        ofType(closeSidenav),
                        skip(1)
                    );

                    return of(query).pipe(
                        takeUntil(nextSearch$),
                        map((books: Book[]) => searchSuccess({ books })),
                        catchError(err =>
                            of(searchFailure({ errorMsg: err.message }))
                        )
                    );
                })
            )
    );

    constructor(
        private actions$: Actions,
    ) { }
}
