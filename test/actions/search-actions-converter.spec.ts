import path from 'path';
import ts from 'typescript';

import { Converter } from '../../src/actions/converters/converter';
import {
    SearchActionsConvertContextFactory
} from '../../src/actions/converters/search-actions-convert.context';
import { Action } from '../../src/actions/models/action.model';
import { CallExpression, NamedType, TypeLiteral } from '../../src/actions/models/type.model';

describe('SearchActionsConverter', () => {
    const base = path.join(__dirname, 'search-actions-converter_data');

    function expectedSearchResult(testFile: string, actionsMap: Map<ts.Symbol, Action>, expectedActions: Partial<Action>[]): void {

        expect(actionsMap, 'search actionsMap is defined').toBeTruthy();
        expect(actionsMap.size, 'found expected actions count').toBe(expectedActions.length);
        const resultIterator = actionsMap.entries();
        for (const expectedAction of expectedActions) {
            const [symbol, action] = resultIterator.next().value;
            expect(action, 'Action equal').toEqual(expectedAction);
            expect(symbol, 'action contain symbol').toBeTruthy();
            expect(symbol.escapedName, 'symbol has correct name').toBe(expectedAction.variable);
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

    function convertFile(testFilePath: string, program: ts.Program): Map<ts.Symbol, Action> {

        return new Converter()
        .convert(
            new SearchActionsConvertContextFactory(),
            program,
            program.getTypeChecker()

        ) as Map<ts.Symbol, Action>;
    }

    function convertFileTest(testFilePath: string, expectedActions: Partial<Action>[]): void {
        const program = createProgram(testFilePath);
        const actionsMap = convertFile(testFilePath, program);
        expectedSearchResult(testFilePath, actionsMap, expectedActions);

    }

    it('Should find one action without props', () => {
        const testFilePath = createPathToTestFile('one-action.actions.ts');

        const expectedActions = [{
            name: '[Book Exists Guard] Load Book',
            props: undefined,
            variable: 'loadBook',
            filePath: testFilePath
        }];

        convertFileTest(testFilePath, expectedActions);


    });

    it('Should find many actions without props', () => {

        const testFilePath = createPathToTestFile('many-actions.actions.ts');

        const expectedActions: Partial<Action>[] = [{
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
        }];

        convertFileTest(testFilePath, expectedActions);

    });


    it('Should find one action with props', () => {

        const testFilePath = createPathToTestFile('one-action-with-props.actions.ts');

        const expectedActions: Partial<Action>[] = [{
            name: '[Heros] Load Heroes Success',
            createActionArgs: [
                new CallExpression('props', [
                    new TypeLiteral([{ name: 'error', type: 'any', }, { 'name': 'books', 'type': 'Book[]' }])
                ])
            ],
            variable: 'loadHeroesSuccess',
            filePath: testFilePath
        }];

        convertFileTest(testFilePath, expectedActions);
    });

    it('Should find many actions with props', () => {

        const testFilePath = createPathToTestFile('many-actions-with-props.actions.ts');

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

        }];

        convertFileTest(testFilePath, expectedActions);
    });

    it('Should find many actions in mixed file', () => {

        const testFilePath = createPathToTestFile('many-actions-mixed-file.actions.ts');

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
        }];

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

        const expectedActions = [{
            name: '[Heros] Load Heroes Success',
            'createActionArgs': [
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
            filePath: testFilePath
        }];

        convertFileTest(testFilePath, expectedActions);
    });


    it('Should find one action with creator function', () => {

        const testFilePath = createPathToTestFile('one-action-with-creator-function.actions.ts');

        const expectedActions = [{
            name: '[Heros] Load Heroes Success',
            createActionArgs: [new NamedType('ArrowFunction')],
            variable: 'loadHeroesSuccess',
            filePath: testFilePath
        }];

        convertFileTest(testFilePath, expectedActions);
    });

    it('Should find ZERO actions', () => {

        const testFilePath = createPathToTestFile('zero.actions.ts');
        const program = createProgram(testFilePath);
        const actionsMap = convertFile(testFilePath, program);
        
        const expectedActionsCount = 0;

        expect(actionsMap, 'search actionsMap is defined').toBeTruthy();
        expect(actionsMap.size, 'found zero actions').toBe(expectedActionsCount);

    });

});

