// @ts-nocheck

import {
    BookActions, BooksApiActions, CollectionApiActions, ViewBookPageActions
} from '@example-app/books/actions';
import { Book } from '@example-app/books/models';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

export const createFunctionFeatureKey = 'keyFromCreateFunctionReducerFile';

export interface State extends EntityState<Book> {
  selectedBookId: string | null;
}

export const adapter: EntityAdapter<Book> = createEntityAdapter<Book>({
  selectId: (book: Book) => book.id,
  sortComparer: false,
});


export const initialState: State = adapter.getInitialState({
  selectedBookId: null,
});

const createFunctionReducer = createReducer(
  initialState,
  on(
    BooksApiActions.searchSuccess,
    CollectionApiActions.loadBooksSuccess,
    (state, { books }) => adapter.addMany(books, state)
  ),
  on(BookActions.loadBook, (state, { book }) => adapter.addOne(book, state)),
  on(ViewBookPageActions.selectBook, (state, { id }) => ({
    ...state,
    selectedBookId: id,
  }))
);

export const reducer = (state: State | undefined, action: Action) => {
  return createFunctionReducer(state, action);
};