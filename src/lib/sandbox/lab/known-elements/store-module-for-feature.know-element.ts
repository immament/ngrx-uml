import ts from 'typescript';

import { NamedConvertedItem } from '../../../core/converters/models';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import { RegisterReducerCallConverter } from '../converters/node-converters/register-reducer-call.converter';

import { KnownElement } from './known-element.model';

export class StoreModuleForFeatureKnowElement extends KnownElement {
    readonly postfixes = ['@ngrx/store/src/store_module".StoreModule.forFeature'];

    private registerReducerCallConverter = new RegisterReducerCallConverter();

    work(context: LabItemConvertContext, node: ts.Node): NamedConvertedItem | undefined {
        if (ts.isCallExpression(node)) {
            const item = this.registerReducerCallConverter.convert(context, node);
            if (item) {

                const symbol = this.resolveParentSymbol(context, node, item);
                StoreModuleForFeatureKnowElement.devLogger.warn('TODO symbol:', !!symbol);
                return item;
            }

        }
        return;
    }

}
