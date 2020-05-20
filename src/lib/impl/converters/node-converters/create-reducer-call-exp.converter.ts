
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import { NodeConverter } from '../../../core/converters/models/node.converter';
import { ConvertedItem } from '../../../core/converters/models/type.model';
import { getCallExpressionName } from '../../../utils/tsutils';
import { Reducer } from '../../models/reducer.model';

const createReducerName = 'createReducer';

export class CreateReducerCallExpConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        if (this.isCreateReducer(node)) {
            const reducer = new Reducer();
            reducer.filePath = node.getSourceFile().fileName;
            log.debug(`Found reducer in ${chalk.gray(reducer.filePath)}`);

            return reducer;
        }
    }

    private isCreateReducer(callExpression: ts.CallExpression): boolean {
        return getCallExpressionName(callExpression) === createReducerName;
    }
}