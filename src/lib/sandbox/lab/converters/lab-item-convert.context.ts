import { Program, Symbol, TypeChecker } from 'typescript';

import { ConvertContext, Converter } from '../../../core/converters';
import { NamedConvertedItem, TypeKind } from '../../../core/converters/models';
import { ItemWithSymbol } from '../../../impl/models';
import { getKeysReplacer, serializeConvertedItemsMapToJson } from '../../../utils';
import { SymbolResolverService } from '../resoloved-items/symbol-resolver.service';

export class LabItemConvertContext implements ConvertContext {

    private result: Map<TypeKind, Map<unknown, NamedConvertedItem>>;
    

    constructor(
        public name: string,
        public program: Program,
        public typeChecker: TypeChecker,
        public converter: Converter,
        public rootKinds: TypeKind[],
        public readonly symbolResolverService: SymbolResolverService,
        lastContext?: ConvertContext,
        private onFinish?: (context: LabItemConvertContext) => void,
        
    ) {
        if (lastContext) {
            this.result = lastContext.getRawResult() as Map<TypeKind, Map<unknown, NamedConvertedItem>>;
        } else {
            this.result = new Map<TypeKind, Map<unknown, NamedConvertedItem>>();
        }
    }

    getRawResult(): Map<TypeKind, Map<unknown, NamedConvertedItem>> {
        return this.result;
    }


    getResult(): Map<TypeKind, NamedConvertedItem[]> | undefined {
        const resultMap = new Map<TypeKind, NamedConvertedItem[]>();

        const resolvedSymbols = this.symbolResolverService.groupByKind();
        for (const [kind, items] of resolvedSymbols.entries()) {
            resultMap.set(kind, items as NamedConvertedItem[]);
        }

        for (const [kind, map] of this.result.entries()) {
            resultMap.set(kind, [...map.values()]);
        }
        return resultMap;
    }

    addResult(itemWithSymbol: ItemWithSymbol): void {

        let map = this.result.get(itemWithSymbol.item.kind);
        if (!map) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            map = new Map<Symbol, NamedConvertedItem>();
            this.result.set(itemWithSymbol.item.kind, map);
        }
        map.set(itemWithSymbol.symbol, itemWithSymbol.item);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    getItem<T extends NamedConvertedItem>(kind: TypeKind, symbol: Symbol): T | undefined {

        const reducersMap = this.result.get(kind);

        if (reducersMap) {
            return reducersMap.get(symbol) as T;
        }
        return;
    }

    serializeResultToJson(parent?: {}): { kind: string; json: string }[] | undefined {
        // TODO: configurable keyReplacer
        return serializeConvertedItemsMapToJson(this.getResult(), parent, getKeysReplacer(['action', 'reducerSymbol', 'references', 'resolvedItems', 'symbol']));
    }

    isRootKind(kind: TypeKind): boolean {
        return this.rootKinds.includes(kind);
    }


    finish(): void {
        this.symbolResolverService.resolveAll();

        if (this.onFinish) {
            this.onFinish(this);
        }
    }

}

