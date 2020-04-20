// @ts-nocheck
export const loadHeroesSuccess = createAction(
  '[Heros] Load Heroes Success',
  props<{error: any, books: Book[]}>()
);
