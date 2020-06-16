import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem } from '../../../core/converters/models';

export interface KnownElement {
    kind: number;
    postfix: string;
    kindText: string;

    work(context: ConvertContext, node: ts.Node): NamedConvertedItem | undefined;
}

export enum KnownElementKinds {
    storeModuleForFeature,
    storeModuleForRoot,
    storeModuleCreateSelector,
    storeCreateSelector,
    storeCreateFeatureSelector,
    storeCreateReducer,
    storeCreateAction,
    storeCreateReducerOn,
    storeCreateActionProps,
    storeSelect,
    storeCombineReducers,
    storeDispatch,
    effectsForFeature,
    other = 999
}

export class SimpleKnownElement implements KnownElement {
    constructor(
        public readonly postfix: string,
        public readonly kind = KnownElementKinds.other
    ) { }

    work(_context: ConvertContext, _node: ts.Node): NamedConvertedItem | undefined {
        return;
    }
    get kindText(): string {
        return KnownElementKinds[this.kind];
    }
}