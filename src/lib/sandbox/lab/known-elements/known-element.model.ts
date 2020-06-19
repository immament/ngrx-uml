import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem } from '../../../core/converters/models';
import { Reducer } from '../../../impl/models';
import devLogger from '../../../utils/logger';
import { printNode } from '../../../utils/preparet-to-print';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import labUtils from '../lab-utils';

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

    work(context: LabItemConvertContext, node: ts.Node): NamedConvertedItem | undefined {
        devLogger.info('+', labUtils.nodeText(node), printNode(node.parent));
        
        const reducer = new Reducer(node.getSourceFile().fileName, node.pos, node.end);
        const parentSymbol = this.findParentSymbol(node);
        if(parentSymbol) {
            devLogger.info('  parentSymbol', parentSymbol.escapedName);
            context.symbolResolverService.addResolvedSymbol(parentSymbol, reducer);
        }
        return reducer;
    }
    get kindText(): string {
        return KnownElementKinds[this.kind];
    }

    findParentSymbol(node: ts.Node): ts.Symbol {
        const parent  = node.parent;
        if(parent.symbol) {
            return parent.symbol;
        }
        if(parent.localSymbol) {
            return parent.localSymbol;
        }
        return this.findParentSymbol(parent);
    }
}