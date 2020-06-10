
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import {
    ConvertedItem
} from '../../../core/converters/models/converted-items/converted-item.model';
import { NodeConverter } from '../../../core/converters/node.converter';
import { getCallExpressionName } from '../../../utils/tsutils';
import { Reducer } from '../../models/reducer.model';

const createReducerName = 'createReducer';

export class CreateReducerCallExpConverter extends NodeConverter {

    convert(_context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        if (this.isCreateReducer(node)) {
            const reducer = new Reducer(
                node.getSourceFile().fileName,
                node.getStart(),
                node.getEnd()
            );
            reducer.filePath = node.getSourceFile().fileName;
            log.debug(`Found reducer in ${chalk.gray(reducer.filePath)}`);

            return reducer;
        }
        return;
    }

    private isCreateReducer(callExpression: ts.CallExpression): boolean {
        return getCallExpressionName(callExpression) === createReducerName;
    }
}