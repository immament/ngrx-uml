import chalk from 'chalk';
import log from 'loglevel';

import { globSync } from '../utils/glob';
import { createProgram } from '../utils/tsutils';
import { getKeyReplacer, writeJsonToFile } from '../utils/utils';
import { findActionReferences } from './findActionReferences';
import { writeDiagramsToFiles } from './mapToPlantUml';
import { ActionReference } from './models/action-reference.model';
import { Action } from './models/action.model';
import { searchActions } from './searchActions';

function saveActions(actions: Action[], outDir: string, fileName: string): void {
    writeJsonToFile(actions,  outDir,  fileName, getKeyReplacer('references'));
    log.info(`Actions saved to ${outDir}${fileName}`);
}


function saveReferences(actionsReferences: ActionReference[], outDir: string, fileName: string): void {
    writeJsonToFile(actionsReferences,  outDir,  fileName, getKeyReplacer('action'));
    log.info(`Action's references saved to ${outDir}${fileName}`);
}


export function generateDiagram(
    { filesPattern, outDir, baseDir = '', tsConfig = 'tsconfig.json' }:
        { filesPattern: string; outDir: string; baseDir?: string; tsConfig?: string }
): void {

    const sourceFilePattern = baseDir + filesPattern;
    log.debug(chalk.yellow('sourceFilePattern:'), sourceFilePattern);
    log.debug(chalk.yellow('baseDir:'), baseDir);
    log.debug(chalk.yellow('tsConfig:'), tsConfig);

    const files = globSync(sourceFilePattern, {});

    const program = createProgram(files, baseDir, tsConfig);
    const checker = program.getTypeChecker();

    const actionsMap = searchActions(program, checker);
    const actions = [...actionsMap.values()];

    saveActions(actions, outDir, '/actions.json');
    const actionsReferences = findActionReferences(program.getSourceFiles(), checker, actionsMap);

  
    saveActions(actions, outDir, '/actions-with-references.json');
    saveReferences(actionsReferences, outDir, '/actions-references.json');

    writeDiagramsToFiles(actions, outDir);    

    log.info(chalk.yellow(`Found ${actionsReferences.length} action's references`));

}


