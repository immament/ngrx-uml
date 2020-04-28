import ts from 'typescript';

import { ConvertContext } from '../../converters/convert.context';
import { Converter } from '../../converters/converter';
import { NamedConvertedItem, TypeKind } from '../../converters/models/type.model';
import { getKeyReplacer, serializeConvertedItemsMapToJson } from '../../utils';
import { ItemWithSymbol } from '../models/action-with-symbol.model';

export class ActionConvertContext implements ConvertContext {

    private result: Map<TypeKind, Map<unknown, NamedConvertedItem>>;

    constructor(
        public name: string,
        public program: ts.Program,
        public typeChecker: ts.TypeChecker,
        public converter: Converter,
        public rootKinds: TypeKind[],
        lastContext?: ConvertContext
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
        for (const [kind, map] of this.result.entries()) {
            resultMap.set(kind, [...map.values()]);
        }
        return resultMap;
    }

    addResult(actionWithSymbol: ItemWithSymbol): void {

        let map = this.result.get(actionWithSymbol.item.kind);
        if (!map) {
            map = new Map<ts.Symbol, NamedConvertedItem>();
            this.result.set(actionWithSymbol.item.kind, map);
        }
        map.set(actionWithSymbol.symbol, actionWithSymbol.item);
    }

    getItem<T extends NamedConvertedItem>(kind: TypeKind, symbol: ts.Symbol): T | undefined {

        const reducersMap = this.result.get(kind);

        if (reducersMap) {
            return reducersMap.get(symbol) as T;
        }
    }

    serializeResultToJson(): { kind: string; json: string }[] | undefined {
        return serializeConvertedItemsMapToJson(this.getResult(), getKeyReplacer('action'));
    }

    isRootKind(kind: TypeKind): boolean {
        return this.rootKinds.includes(kind);
    }
}

