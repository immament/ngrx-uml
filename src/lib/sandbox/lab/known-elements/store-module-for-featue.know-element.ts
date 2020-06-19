import ts from 'typescript';

import { NamedConvertedItem } from '../../../core/converters/models';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import { RegisterReducerCallConverter } from '../converters/node-converters/register-reducer-call.converter';

import { KnownElement, KnownElementKinds } from './known-element.model';

export class StoreModuleForFeatureKnowElement implements KnownElement {
    readonly kind = KnownElementKinds.storeModuleForFeature;
    readonly postfix = '@ngrx/store/src/store_module".StoreModule.forFeature';

    private registerReducerCallConverter = new RegisterReducerCallConverter();

    work(context: LabItemConvertContext, node: ts.Node): NamedConvertedItem | undefined {
        if (ts.isCallExpression(node)) {
            return this.registerReducerCallConverter.convert(context, node);
        }
        return;
    }

    get kindText(): string {
        return KnownElementKinds[this.kind];
    }
}
