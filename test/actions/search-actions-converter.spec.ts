import path from 'path';
import ts from 'typescript';

import { Converter } from '../../src/lib/core/converters';
import {
    CallExpression, NamedConvertedItem, NamedType, TypeKind, TypeLiteral, TypeReference
} from '../../src/lib/core/converters/models';
import {
    ActionConvertContextFactory
} from '../../src/lib/impl/converters/action-convert-context.factory';
import { Action } from '../../src/lib/impl/models/action.model';

describe('SearchActionsConverter', () => {
    const base = path.join(__dirname, 'search-actions-converter_data');

    function expectedSearchResult(
        expectedActions: Partial<Action>[],
        convertedItemsMap?: Map<TypeKind, NamedConvertedItem[]>
    ): void {

        expect(convertedItemsMap, 'search actionsMap is defined').toBeTruthy();
        if (!convertedItemsMap) {
            return;
        }
        const convertedActions = convertedItemsMap.get(TypeKind.Action);

        expect(convertedActions, 'search actions is defined').toBeTruthy();
        if (!convertedActions) {
            return;
        }
        expect(convertedActions.length, 'found expected actions count').toBe(expectedActions.length);
        const resultIterator = convertedActions.values();
        for (const expectedAction of expectedActions) {
            const action = resultIterator.next().value;
            // ignore pos and end
            expect(action.pos, 'Action pos > 0').toBeGreaterThan(0);
            expect(action.end, 'Action end > 0').toBeGreaterThan(0);

            action.pos = 0;
            action.end = 0;
            expect(action, 'Action equal').toEqual(expectedAction);
            // expect(symbol, 'action contain symbol').toBeTruthy();
            // expect(symbol.escapedName, 'symbol has correct name').toBe(expectedAction.variable);
        }
    }

    function createProgram(testFile: string): ts.Program {
        const program = ts.createProgram([testFile], {});
        const sourceFile = program.getSourceFile(testFile);
        expect(sourceFile, 'program returns source file').toBeTruthy();
        return program;
    }


    function createPathToTestFile(fileName: string): string {
        return path.join(base, fileName);
    }

    function convertFile(program: ts.Program): Map<TypeKind, NamedConvertedItem[]> | undefined {

        const converter = new Converter();
        const typeChecker = program.getTypeChecker();
        const context = new ActionConvertContextFactory().create(program, typeChecker, converter, undefined);

        return converter.convert(context, program);
    }

    function convertFileTest(testFilePath: string, expectedActions: Partial<Action>[]): void {
        const program = createProgram(testFilePath);
        const convertedItemsMap = convertFile(program);
        expectedSearchResult(expectedActions, convertedItemsMap);

    }

    function toActions(actions: Partial<Action>[]): Action[] {
        return actions.map(a => ({
            ...new Action(a.name || '', a.filePath|| '', 0, 0),
            ...a
        } as Action));
    }

    it('Should find one action without props', () => {
        const testFilePath = createPathToTestFile('one-action.actions.ts');

        const expectedActions = toActions([{
            name: '[Book Exists Guard] Load Book',
            variable: 'loadBook',
            filePath: testFilePath
        }]);

        convertFileTest(testFilePath, expectedActions);


    });

    it('Should find many actions without props', () => {

        const testFilePath = createPathToTestFile('many-actions.actions.ts');

        const expectedActions: Partial<Action>[] = toActions([{
            name: '[Books] Remove Book',
            variable: 'removeBook',
            filePath: testFilePath
        }, {
            name: '[Collection/Api] Load Collection',
            variable: 'loadCollection',
            filePath: testFilePath
        }, {
            name: '[Collection/Api] Add book',
            variable: 'addBook',
            filePath: testFilePath
        }]);

        convertFileTest(testFilePath, expectedActions);

    });


    it('Should find one action with props', () => {

        const testFilePath = createPathToTestFile('one-action-with-props.actions.ts');

        const expectedActions: Partial<Action>[] = toActions([{
            name: '[Heros] Load Heroes Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{ name: 'error', type: 'any', }, { 'name': 'books', 'type': 'Book[]' }])
                ])
            ],
            variable: 'loadHeroesSuccess',
            filePath: testFilePath
        }]);

        convertFileTest(testFilePath, expectedActions);
    });

    it('Should find many actions with props', () => {

        const testFilePath = createPathToTestFile('many-actions-with-props.actions.ts');

        const expectedActions = toActions([{
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
            filePath: testFilePath
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
            filePath: testFilePath
        }, {
            name: '[Collection/Api] Add book',
            variable: 'addBook',
            filePath: testFilePath,
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([])
                ])
            ]
        }, {
            name: '[Heroes Page] Add Hero',
            variable: 'addHero',
            filePath: testFilePath

        }]);

        convertFileTest(testFilePath, expectedActions);
    });

    it('Should find many actions in mixed file', () => {

        const testFilePath = createPathToTestFile('many-actions-mixed-file.actions.ts');

        const expectedActions: Partial<Action>[] = toActions([{
            name: '[Collection/API] Load Books Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{
                        'name': 'books',
                        'type': 'Book[]'
                    }])])
            ],
            variable: 'loadBooksSuccess',
            filePath: testFilePath
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
            filePath: testFilePath
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
            filePath: testFilePath
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
            filePath: testFilePath
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
            filePath: testFilePath
        }, {
            name: '[Collection/API] Remove Book Failure',
            variable: 'removeBookFailure',
            filePath: testFilePath,
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([])
                ])]
        }]);

        convertFileTest(testFilePath, expectedActions);
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

        const testFilePath = createPathToTestFile('one-action-with-type-in-props.actions.ts');

        const expectedActions: Partial<Action>[] = toActions([{
            name: '[Heros] Load Heroes Success',
            'createActionArgs': [
                new CallExpression('props', [new TypeReference('Heroes')])
            ],
            variable: 'loadHeroesSuccess',
            filePath: testFilePath
        }]);

        convertFileTest(testFilePath, expectedActions);
    });


    it('Should find one action with creator function', () => {

        const testFilePath = createPathToTestFile('one-action-with-creator-function.actions.ts');

        const expectedActions = toActions([{
            name: '[Heros] Load Heroes Success',
            createActionArgs: [new NamedType('ArrowFunction')],
            variable: 'loadHeroesSuccess',
            filePath: testFilePath
        }]);

        convertFileTest(testFilePath, expectedActions);
    });

    it('Should find ZERO actions', () => {

        const testFilePath = createPathToTestFile('zero.actions.ts');
        const program = createProgram(testFilePath);
        const convertedItemsMap = convertFile(program);

        expect(convertedItemsMap, 'search actionsMap is defined').toBeTruthy();
        if (!convertedItemsMap) {
            return;
        }

        const convertedActions = convertedItemsMap.get(TypeKind.Action);

        expect(convertedActions, 'found zero actions').toBeUndefined();

    });

});

