// @ts-nocheck

import { asyncScheduler, EMPTY as empty, of } from 'rxjs';
import { catchError, debounceTime, map, skip, switchMap, takeUntil } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { Book } from '@example-app/books/models';
import { GoogleBooksService } from '@example-app/core/services';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { BooksApiActions, FindBookPageActions } from '../actions';
import { Book } from '../models';

export interface Book {
    id: string;
    volumeInfo: {
        title: string;
        subtitle: string;
        authors: string[];
        publisher: string;
        publishDate: string;
        description: string;
        averageRating: number;
        ratingsCount: number;
        imageLinks: {
            thumbnail: string;
            smallThumbnail: string;
        };
    };
}

/**
 * Load Collection Actions
 */


export function generateMockBook(): Book {
    return {
        id: '1',
        volumeInfo: {
            title: 'title',
            subtitle: 'subtitle',
            authors: ['author'],
            publisher: 'publisher',
            publishDate: '',
            description: 'description',
            averageRating: 3,
            ratingsCount: 5,
            imageLinks: {
                thumbnail: 'string',
                smallThumbnail: 'string',
            },
        },
    };
}

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
    ) { }
}


/**
 * Add Book to Collection Actions
 */


/**
 * Remove Book from Collection Actions
 */
