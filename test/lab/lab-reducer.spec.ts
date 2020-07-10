import chalk from 'chalk';
import log from 'loglevel';
import path from 'path';
import ts from 'typescript';

import { ConvertContext, Converter } from '../../src/lib/core/converters';
import { LabConvertContextFactory } from '../../src/lib/sandbox/lab/converters/lab-convert-context.factory';
import { writeToFile } from '../../src/lib/utils';
import devLogger, { logFnNameWithFile } from '../../src/lib/utils/logger';

const programFiles: string[] = [];

describe('lab reducer', () => {
    log.setLevel(log.levels.INFO);
    logFnNameWithFile(devLogger, log.levels.ERROR);
    devLogger.setLevel(log.levels.INFO);

    let testFileName: string;
    let program: ts.Program;
    let typeChecker: ts.TypeChecker;
    let converter: Converter;

    const baseDir = path.join(__dirname, 'lab_data');
    function createPathToTestFile(fileName: string): string {
        return path.join(baseDir, fileName);
    }

    beforeAll(() => {

        testFileName = createPathToTestFile('simple.reducer.ts');

        program = ts.createProgram([testFileName, ...programFiles.map((fileName) => createPathToTestFile(fileName))], {});

        typeChecker = program.getTypeChecker();
        converter = new Converter();
    });


    it('Should resolve reducer keys', () => {
        log.info(`++ TEST START ++`);
        const convertContext = new LabConvertContextFactory().create(program, typeChecker, converter);

        const sourceFile = program.getSourceFile(testFileName);
        expect(sourceFile).toBeTruthy();
        if (!sourceFile) return;

        // const tokens = getTokens('createReducer(', sourceFile, (node: ts.Node): boolean => ts.isCallExpression(node));
        // for (const token of tokens) {

        const convertedItem = converter.convert(convertContext, program);
        expect(convertedItem).toBeTruthy();

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        saveConvertResult(convertContext, '../out');
    });


    function saveConvertResult(context: ConvertContext, outDir: string,): void {
        const result = context.serializeResultToJson({ rootPath: baseDir });
        if (result) {
            for (const { kind, json } of result) {
                const filePath = writeToFile(json, path.join(outDir, 'json'), `${context.name}_${kind}.json`);
                log.info(`Convert result saved to: ${chalk.gray(filePath)}`);

            }
        }
    }


});