import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { globSync } from '../utils/glob';
import { createProgram } from '../utils/tsutils';
import { getKeyReplacer, writeJsonToFile } from '../utils/utils';
import { Converter } from './converters/converter';
import { SearchActionsConvertContextFactory } from './converters/search-actions-convert.context';
import { findActionReferences } from './findActionReferences';
import { writeDiagramsToFiles } from './mapToPlantUml';
import { ActionReference } from './models/action-reference.model';
import { Action } from './models/action.model';
import { ActionsMap } from './searchActions';

function saveActions(actions: Action[], outDir: string, fileName: string): void {
    writeJsonToFile(actions,  outDir,  fileName, getKeyReplacer('references'));
    log.info(`Actions saved to ${outDir}${fileName}`);
}


function saveReferences(actionsReferences: ActionReference[], outDir: string, fileName: string): void {
    writeJsonToFile(actionsReferences,  outDir,  fileName, getKeyReplacer('action'));
    log.info(`Action's references saved to ${outDir}${fileName}`);
}


export function generateDiagram(
    { filesPattern, outDir, baseDir = '', tsConfigFileName = 'tsconfig.json' }:
        { filesPattern: string; outDir: string; baseDir?: string; tsConfigFileName?: string }
): void {

    const sourceFilePattern = baseDir + filesPattern;
    log.debug(chalk.yellow('sourceFilePattern:'), sourceFilePattern);
    log.debug(chalk.yellow('baseDir:'), baseDir);
    log.debug(chalk.yellow('tsConfig:'), tsConfigFileName);

    const files = globSync(sourceFilePattern, {});

    const program = createProgram(files, baseDir, tsConfigFileName);
    const typeChecker = program.getTypeChecker();
    
    const converter = new Converter();
    
    const actionsMap = converter.convert(new SearchActionsConvertContextFactory(), program, typeChecker) as ActionsMap;

    const actions = [...actionsMap.values()];
    saveActions(actions, outDir, '/actions.json');


    const actionsReferences = findActionReferences(program.getSourceFiles(), typeChecker, actionsMap);

  
    saveActions(actions, outDir, '/actions-with-references.json');
    saveReferences(actionsReferences, outDir, '/actions-references.json');

    writeDiagramsToFiles(actions, outDir);    

    log.info(chalk.yellow(`Found ${actionsReferences.length} action's references`));

}


