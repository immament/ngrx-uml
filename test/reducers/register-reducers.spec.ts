import log from 'loglevel';
import path from 'path';
import ts from 'typescript';

import { Converter } from '../../src/lib/core/converters';
import { TypeKind } from '../../src/lib/core/converters/models';
import {
    RegisteredReducerItem
} from '../../src/lib/sandbox/converters/models/registered-reducer.model';
import {
    ModulesConvertContextFactory
} from '../../src/lib/sandbox/converters/modules-context.factory';
import {
    RegisterReducerCallConverter
} from '../../src/lib/sandbox/converters/node-converters/register-reducer-call.converter';
import { syntaxKindText } from '../../src/lib/utils';
import { getTokens } from '../utils/utils';

const programFiles = ['combined.reducer.ts', 'create-function.reducer.ts'];

describe('Register reducers using forFeature', () => {
    log.setLevel(log.levels.INFO);

    let testFileName: string;
    let program: ts.Program;
    let typeChecker: ts.TypeChecker;
    let converter: Converter;

    const baseDir = path.join(__dirname, 'sandbox-converter_data');
    function createPathToTestFile(fileName: string): string {
        return path.join(baseDir, fileName);
    }

    beforeAll(() => {
        testFileName = createPathToTestFile('coach.module.ts');

        program = ts.createProgram([testFileName, ...programFiles.map((fileName) => createPathToTestFile(fileName))], {});

        typeChecker = program.getTypeChecker();
        converter = new Converter();
    });

    function expectRegisteredReducer(current: RegisteredReducerItem, expected: Partial<RegisteredReducerItem>, label: string): void {
        expect(current, `Registered item is defined [${label}]`).toBeTruthy();
        expect(current.kind, `Reducer item has correct kind [${label}]`).toBe(TypeKind.RegisteredReducer);
        expect(current.end, `End position is valid [${label}]`).toBeGreaterThan(0);
        expect(current.pos, `Position is valid [${label}]`).toBeGreaterThan(0);
        expect(current.name, `Name equal to expected [${label}]`).toBe(expected.name);
        if (expected.filePath) {
            expect(current.filePath.endsWith(expected.filePath), `filepath is correct [${label}]`).toBeTruthy();
        }
    }


    it('Should resolve reducer keys', () => {
        const convertContext = new ModulesConvertContextFactory().create(program, typeChecker, converter);

        const expectedReducers: Partial<RegisteredReducerItem>[] = [
            {
                filePath: testFileName,
                name: 'keyFromString'
            },
            {
                filePath: testFileName,
                name: 'keyFromProperty'
            },
            {
                filePath: testFileName,
                name: 'keyFromReducerFile'
            },
            {
                filePath: testFileName,
                name: 'keyFromCreateFunctionReducerFile'
            }
        ];


        const sourceFile = program.getSourceFile(testFileName);
        expect(sourceFile).toBeTruthy();
        if (!sourceFile) return;

        const storeModuleCallConverter = new RegisterReducerCallConverter();

        const tokens = getTokens('StoreModule.forFeature', sourceFile, (node: ts.Node): boolean => !!ts.isCallExpression(node));

         // log.info('tokens', printNode(tokens.map(t => prepareToPrint(t)), 8));
        for (const [index, node] of tokens.entries()) {
            if (ts.isCallExpression(node)) {
                const registeredReducer = storeModuleCallConverter.convert(convertContext, node) as RegisteredReducerItem;
                expectRegisteredReducer(registeredReducer, expectedReducers[index], ''+index);

            } else {
                log.warn('expect callExpression got', syntaxKindText(node));
            }
        }
    });

    interface ExpectedReducers {
        symbol?: { escapedName: string };
        registered?: Partial<RegisteredReducerItem>[];
    }

    it('Should resolve reducers', () => {
        const convertContext = new ModulesConvertContextFactory().create(program, typeChecker, converter);

        const expectedReducers: ExpectedReducers[] = [
            {
                symbol: {
                    escapedName: 'reducer'
                }
            },
            {
                symbol: {
                    escapedName: 'reducer'
                }
            },
            {
                registered: [{
                    kindText: 'RegisteredReducer',
                    kind: 1006,
                    name: 'simpleFeature',
                    filePath: createPathToTestFile('simple.reducer.ts'),
                    reducerSymbol: {
                        escapedName: 'reducer',
                    } as ts.Symbol
                }]
            },
            {
                symbol: {
                    escapedName: 'createFunctionReducer' // TODO: exported: 'reducer'
                }
            },
        ];

        const sourceFile = program.getSourceFile(testFileName);
        expect(sourceFile).toBeTruthy();
        if (!sourceFile) return;

        const storeModuleCallConverter = new RegisterReducerCallConverter();

        const tokens = getTokens('StoreModule.forFeature', sourceFile, (node: ts.Node): boolean => !!ts.isCallExpression(node));
        // storeModuleCallConverter.printSymbolFlags();
        for (const [index, node] of tokens.entries()) {
            if (ts.isCallExpression(node)) {
                const reducer = storeModuleCallConverter.getReducer(convertContext, node.arguments[1]);

                const expected = expectedReducers[index];

                expect(reducer, `Reducer is found [${index}]`).toBeTruthy();
                if (!reducer) return;

                if (expected.symbol) {
                    expect(reducer.symbol, `Symbol is found [${index}]`).toBeTruthy();
                    expect(reducer.symbol?.escapedName, `Symbol name is equal [${index}]`).toBe(expected.symbol.escapedName);
                }

                if (expected.registered) {
                    expect(reducer.registered, `Registered search item is found [${index}]`).toBeTruthy();
                    if (reducer.registered) {
                        for (const [reducerIndex, registeredReducer] of reducer.registered.entries()) {
                            const label = `${index}/${reducerIndex}`;
                            const expectedRegisteredReducer = expected.registered[reducerIndex];
                            expect(registeredReducer.reducerSymbol, `Symbol is found [${label}]`).toBeTruthy();
                            expect(registeredReducer.reducerSymbol?.escapedName, `Symbol name is equal [${label}]`)
                                .toBe(expected.registered[reducerIndex].reducerSymbol?.escapedName);
                            expect(registeredReducer.kind, `Kind is equal [${label}]`).toBe(expectedRegisteredReducer.kind);

                            expectRegisteredReducer(registeredReducer, expectedRegisteredReducer, label );
                        }
                    }
                }

            } else {
                log.warn('expect callExpression got', syntaxKindText(node));
            }
        }

    });
});