import { asyncScheduler, EMPTY as empty, of } from 'rxjs';
import { catchError, debounceTime, map, skip, switchMap, takeUntil } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { GoogleBooksService } from '@example-app/core/services';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { BooksApiActions, FindBookPageActions } from '../actions';
import { Book } from '../models';

@Injectable()
export class BookEffects {
  search$ = createEffect(
    () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
      this.actions$.pipe(
        ofType(FindBookPageActions.searchBooks),
        debounceTime(debounce, scheduler),
        switchMap(({ query }) => {
          if (query === '') {
            return empty;
          }

          const nextSearch$ = this.actions$.pipe(
            ofType(FindBookPageActions.searchBooks),
            skip(1)
          );

          return this.googleBooks.searchBooks(query).pipe(
            takeUntil(nextSearch$),
            map((books: Book[]) => BooksApiActions.searchSuccess({ books })),
            catchError(err =>
              of(BooksApiActions.searchFailure({ errorMsg: err.message }))
            )
          );
        })
      )
  );

  constructor(
    private actions$: Actions,
    private googleBooks: GoogleBooksService
  ) {}
}
