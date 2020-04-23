/* eslint-disable @typescript-eslint/no-use-before-define */
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { Action } from './models/action.model';

// import searchActionsInFile from './searchActionsInFile';

export type ActionsMap = Map<ts.Symbol, Action>;

export function searchActions(program: ts.Program, _checker: ts.TypeChecker): ActionsMap {

    const actionsMap = new Map<ts.Symbol, Action>();
    for (const sourceFile of program.getSourceFiles()) {
        search(sourceFile);
    }

    log.info(chalk.yellow(`Found ${actionsMap.size} actions`));
    return actionsMap;

    function search(sourceFile: ts.SourceFile): void {
        log.trace('search action in file: ' + sourceFile.fileName);

        // const foundedActions = searchActionsInFile(sourceFile, checker);
        
        // if (foundedActions.length) {
        //     log.debug(`Found ${foundedActions.length} actions in ${sourceFile.fileName}`);
        //     for (const actionWithSymbol of foundedActions) {
        //         actionsMap.set(actionWithSymbol.symbol, actionWithSymbol.action);
        //     }
        // }
    }
}

