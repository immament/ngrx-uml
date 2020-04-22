// @ts-nocheck
// export const loadBook = createAction(
//     '[Book Exists Guard] Load Book',
//     props<{ book: Book ; name: string}>(),
//     (request: Request) => (true)
// );

export const CreateBook = createAction(
    '[Books] Create',
    props<{book: Book}, {history: H[]}, AnotherType>()
);

const loadBook = createAction(
    '[Books] Load',
    props<Typed>()
);

const addBook = createAction(
    '[Books] Add',
    this.otherFunction
);