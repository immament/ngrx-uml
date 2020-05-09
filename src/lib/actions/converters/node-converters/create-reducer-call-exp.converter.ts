
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../converters/convert.context';
import { NodeConverter } from '../../../converters/models/node.converter';
import { ConvertedItem } from '../../../converters/models/type.model';
import { Reducer } from '../../../reducers/converters/models/reducer.model';
import { getCallExpressionName } from '../../../utils/tsutils';

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