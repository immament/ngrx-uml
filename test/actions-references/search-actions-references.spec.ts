
import log from 'loglevel';
import path from 'path';
import ts from 'typescript';

import { ConvertContext, ConvertContextFactory, Converter } from '../../src/lib/core/converters';
import { NamedConvertedItem, TypeKind } from '../../src/lib/core/converters/models';
import {
    ActionConvertContextFactory,
} from '../../src/lib/impl/converters/action-convert-context.factory';
import {
    ActionReferenceConvertContextFactory,
} from '../../src/lib/impl/converters/action-reference-convert-context.factory';
import { Action, ActionReference } from '../../src/lib/impl/models';

describe('Search Actions References', () => {
    let actionConvertFactory: ActionConvertContextFactory;
    let actionReferenceFactory: ActionReferenceConvertContextFactory;

    beforeAll(() => {
        log.setLevel(log.levels.WARN);
        actionConvertFactory = new ActionConvertContextFactory;
        actionReferenceFactory = new ActionReferenceConvertContextFactory;
        log.trace = log.debug;
    });

    const base = path.join(__dirname, 'search-actions-references_data');

    function createPathToTestFile(fileName: string): string {
        return path.join(base, fileName);
    }


    function convert(program: ts.Program, convertFactories: ConvertContextFactory[]): Map<TypeKind, NamedConvertedItem[]> | undefined {
        const converter = new Converter();
        const typeChecker = program.getTypeChecker();
        let converterResult: Map<TypeKind, NamedConvertedItem[]> | undefined;
        let lastContext: ConvertContext | undefined;
        for (const contextFactory of convertFactories) {
            const context = contextFactory.create(program, typeChecker, converter, lastContext);
            converterResult = converter.convert(context, program);
            lastContext = context;
        }
        return converterResult;
    }

    /**
     * Remove file paths diffrent in enviroments
     */
    function prepareActionReferencesToSnapshot(actionReferences: ActionReference[]): void {
        actionReferences?.forEach(ar => {
            ar.fileName = undefined;
            if (ar.action) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ar.action as any).filePath = undefined;
            }
        });

    }

    function checkResult(result: Map<TypeKind, NamedConvertedItem[]> | undefined): void {
        expect(result).toBeDefined();

        const actions = result?.get(TypeKind.Action);
        expect(actions).toBeDefined();
        expect(actions).toHaveLength(1);
        if (!actions) return;
        const actionReferences = (actions[0] as Action).references;
        expect(actionReferences).toBeDefined();
        expect(actionReferences).toHaveLength(1);
        if (actionReferences) {
            prepareActionReferencesToSnapshot(actionReferences);
            expect(actionReferences).toMatchSnapshot();

        }
    }

    it('Should find one action reference WITH alias', () => {
        const programFiles = ['references/with-alias.ts', 'actions/actions.ts'];
        const program = ts.createProgram([...programFiles.map((fileName) => createPathToTestFile(fileName))], {});
        const result = convert(program, [actionConvertFactory, actionReferenceFactory]);
        checkResult(result);
    });

    it('Should find one action reference WITHOUT alias', () => {
        const programFiles = ['references/without-alias.ts', 'actions/actions.ts'];
        const program = ts.createProgram([...programFiles.map((fileName) => createPathToTestFile(fileName))], {});
        const result = convert(program, [actionConvertFactory, actionReferenceFactory]);
        checkResult(result);
    });

    it('Should find one action reference WITH tsconfig path and import alias', () => {
        const programFiles = ['references/with-tsconfig-path-with-import-alias.ts', 'actions/actions.ts'];
        const program = ts.createProgram([...programFiles.map((fileName) => createPathToTestFile(fileName))], {
            baseUrl: base,
            paths: {
                '@app/*': ['./actions/*']
            }
        });

        log.info('program.getCompilerOptions()', program.getCompilerOptions());
        const result = convert(program, [actionConvertFactory, actionReferenceFactory]);
        checkResult(result);
    });

    it('Should find one action reference WITH tsconfig path and WITHOUT import alias', () => {
        const programFiles = ['references/with-tsconfig-path-without-import-alias.ts', 'actions/actions.ts'];
        const program = ts.createProgram([...programFiles.map((fileName) => createPathToTestFile(fileName))], {
            baseUrl: base,
            paths: {
                '@app/*': ['./actions/*']
            }
        });

        log.info('program.getCompilerOptions()', program.getCompilerOptions());
        const result = convert(program, [actionConvertFactory, actionReferenceFactory]);
        checkResult(result);
    });
});