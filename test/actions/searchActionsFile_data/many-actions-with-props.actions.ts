// @ts-nocheck

export const removeBook = createAction(
  '[Books] Remove Book',
  props<{
    silent: boolean,
    clear,
    book: Book,
    options: {},
    options: 2
  }>()
);

export const loadCollection = createAction(
  '[Collection/Api] Load Collection',
  props<{ id: string }>()
);

export const addBook = createAction(
  '[Collection/Api] Add book',
  props<{}>()
);

export const addHero = createAction(
  '[Heroes Page] Add Hero'
);


