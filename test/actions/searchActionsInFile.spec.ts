import path from 'path';
import ts from 'typescript';

import { ActionWithSymbol } from '../../src/actions/models/action-with-symbol.model';
import { Action } from '../../src/actions/models/action.model';
import { CallExpression, NamedType, TypeLiteral } from '../../src/actions/models/type.model';
import searchActionsInFile from '../../src/actions/searchActionsInFile';

describe('searchActionsInFile', () => {
    const base = path.join(__dirname, 'searchActionsFile_data');

    function expectedSearchResult(testFile: string, result: ActionWithSymbol[], expectedActions: Partial<Action>[]): void {

        expect(result, 'search result is defined').toBeTruthy();
        expect(result.length, 'found expected actions count').toBe(expectedActions.length);
        const resultiterator = result.values();
        for (const expectedAction of expectedActions) {
            const actionWithSymbol = resultiterator.next().value as ActionWithSymbol;
            expect(actionWithSymbol.action, 'Action equal').toEqual(expectedAction);
            expect(actionWithSymbol.symbol, 'action contain symbol').toBeTruthy();
            expect(actionWithSymbol.symbol.escapedName, 'symbol has correct name').toBe(expectedAction.variable);
        }
    }


    it('Should find one action without props', () => {

        const testFile = path.join(base, 'one-action.actions.ts');

        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions = [{
            name: '[Book Exists Guard] Load Book',
            props: undefined,
            variable: 'loadBook',
            filePath: testFile
        }];

        expectedSearchResult(testFile, result, expectedActions);



    });

    it('Should find many actions without props', () => {

        const testFile = path.join(base, 'many-actions.actions.ts');

        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions: Partial<Action>[] = [{
            name: '[Books] Remove Book',
            variable: 'removeBook',
            filePath: testFile
        }, {
            name: '[Collection/Api] Load Collection',
            variable: 'loadCollection',
            filePath: testFile
        }, {
            name: '[Collection/Api] Add book',
            variable: 'addBook',
            filePath: testFile
        }];

        expectedSearchResult(testFile, result, expectedActions);
    });


    it('Should find one action with props', () => {

        const testFile = path.join(base, 'one-action-with-props.actions.ts');
        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions: Partial<Action>[] = [{
            name: '[Heros] Load Heroes Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{ name: 'error', type: 'any', }, { 'name': 'books', 'type': 'Book[]' }])
                ])
            ],
            variable: 'loadHeroesSuccess',
            filePath: testFile
        }];

        expectedSearchResult(testFile, result, expectedActions);
    });

    it('Should find many actions with props', () => {

        const testFile = path.join(base, 'many-actions-with-props.actions.ts');

        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions: Partial<Action>[] = [{
            name: '[Books] Remove Book',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'silent',
                        'type': 'boolean',
                    }, {
                        'name': 'clear',
                        'type': undefined,
                    }, {
                        'name': 'book',
                        'type': 'Book',
                    }, {
                        'name': 'options',
                        'type': '{}',
                    }, {
                        'name': 'options',
                        'type': '2',
                    }])
                ])
            ],
            variable: 'removeBook',
            filePath: testFile
        }, {
            name: '[Collection/Api] Load Collection',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'id',
                        'type': 'string',
                    }])
                ])
            ],
            variable: 'loadCollection',
            filePath: testFile
        }, {
            name: '[Collection/Api] Add book',
            variable: 'addBook',
            filePath: testFile,
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([])
                ])
            ]
        }, {
            name: '[Heroes Page] Add Hero',
            variable: 'addHero',
            filePath: testFile

        }];

        expectedSearchResult(testFile, result, expectedActions);
    });

    it('Should find many actions in mixed file', () => {

        const testFile = path.join(base, 'many-actions-mixed-file.actions.ts');

        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions: Partial<Action>[] = [{
            name: '[Collection/API] Load Books Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'books',
                        'type': 'Book[]'
                    }])])
            ],
            variable: 'loadBooksSuccess',
            filePath: testFile
        }, {
            name: '[Collection/API] Load Books Failure',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'error',
                        'type': 'any',
                    }])
                ])
            ],
            variable: 'loadBooksFailure',
            filePath: testFile
        }, {
            name: '[Collection/API] Add Book Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'book',
                        'type': 'Book',
                    }])
                ])
            ],
            variable: 'addBookSuccess',
            filePath: testFile
        }, {
            name: '[Collection/API] Add Book Failure',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'book',
                        'type': 'Book',
                    }])
                ])
            ],
            variable: 'addBookFailure',
            filePath: testFile
        }, {
            name: '[Collection/API] Remove Book Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'book',
                        'type': 'Book',
                    }])
                ])
            ],

            variable: 'removeBookSuccess',
            filePath: testFile
        }, {
            name: '[Collection/API] Remove Book Failure',
            variable: 'removeBookFailure',
            filePath: testFile,
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([])
                ])]
        }];

        expectedSearchResult(testFile, result, expectedActions);
    });


    // let startTime: number, endTime: number;

    // function start(): void {
    //     startTime = new Date().getTime();
    // }

    // function end(): void {
    //     endTime = new Date().getTime();
    //     const timeDiff = endTime - startTime; //in ms
    // }

    it('Should find one action with Type in props', () => {

        const testFile = path.join(base, 'one-action-with-type-in-props.actions.ts');

        const program = ts.createProgram([testFile], {});

        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions = [{
            name: '[Heros] Load Heroes Success',
            'createActionArgs':  [
                      {
                       'kind': 196,
                       'kindText': 'CallExpression',
                       'name': 'props',
                       'typeArguments': [
                          {
                           'kind': 169,
                           'kindText': 'TypeReference',
                           'name': 'Heroes',
                         },
                       ],
                     },
                   ],
            variable: 'loadHeroesSuccess',
            filePath: testFile
        }];

        expectedSearchResult(testFile, result, expectedActions);


    });


    it('Should find one action with creator function', () => {

        const testFile = path.join(base, 'one-action-with-creator-function.actions.ts');

        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActions = [{
            name: '[Heros] Load Heroes Success',
            createActionArgs: [new NamedType('ArrowFunction')],
            variable: 'loadHeroesSuccess',
            filePath: testFile
        }];

        expectedSearchResult(testFile, result, expectedActions);
    });

    it('Should find ZERO actions', () => {

        const testFile = path.join(base, 'zero.actions.ts');

        const program = ts.createProgram([testFile], {});
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(testFile);

        expect(sourceFile, 'program returns source file').toBeTruthy();

        const result = searchActionsInFile(sourceFile!, typeChecker);

        const expectedActionsCount = 0;

        expect(result, 'search result is defined').toBeTruthy();
        expect(result.length, 'found zero actions').toBe(expectedActionsCount);

    });
});
