import chalk from 'chalk';
import log from 'loglevel';
import path from 'path';
import { stdout } from 'process';
import ts from 'typescript';

import { CustomConsole } from '@jest/console';

import { ConvertContext, Converter } from '../../src/lib/core/converters';
import { LabConvertContextFactory } from '../../src/lib/sandbox/lab/converters/lab-convert-context.factory';
import { writeToFile } from '../../src/lib/utils';
import { configLoggers } from '../../src/lib/utils/logger';

const programFiles: string[] = [];

global.console = new CustomConsole(stdout, stdout);


describe('lab effects', () => {

    // console.log(console);
    configLoggers(['converter', 'node-converter', 'symbol-resolve', 'lab-utils', 'known-element'], log.levels.INFO, true);

    log.setLevel('INFO');
    let testFileName: string;
    let program: ts.Program;
    let typeChecker: ts.TypeChecker;
    let converter: Converter;

    const baseDir = path.join(__dirname, 'lab_data');
    function createPathToTestFile(fileName: string): string {
        return path.join(baseDir, fileName);
    }

    beforeAll(() => {

        testFileName = createPathToTestFile('simple.effects.ts');

        program = ts.createProgram([testFileName, ...programFiles.map((fileName) => createPathToTestFile(fileName))], {});

        typeChecker = program.getTypeChecker();
        converter = new Converter();
    });


    it('Should resolve reducer keys', async () => {
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