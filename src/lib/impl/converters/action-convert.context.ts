import { Program, Symbol, TypeChecker } from 'typescript';

import { ConvertContext } from '../../core/converters/convert.context';
import { Converter } from '../../core/converters/converter';
import { NamedConvertedItem, TypeKind } from '../../core/converters/models/type.model';
import { getKeyReplacer, serializeConvertedItemsMapToJson } from '../../utils';
import { ItemWithSymbol } from '../models/item-with-symbol.model';

export class ActionConvertContext implements ConvertContext {

    private result: Map<TypeKind, Map<unknown, NamedConvertedItem>>;

    constructor(
        public name: string,
        public program: Program,
        public typeChecker: TypeChecker,
        public converter: Converter,
        public rootKinds: TypeKind[],
        lastContext?: ConvertContext,
        private onFinish?: (context: ActionConvertContext) => void
    ) {
        if (lastContext) {
            this.result = lastContext.getRawResult() as Map<TypeKind, Map<unknown, NamedConvertedItem>>;
        } else {
            this.result = new Map<TypeKind, Map<unknown, NamedConvertedItem>>();
        }

    }
    finish(): void {
        if(this.onFinish) {
            this.onFinish(this);
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
            // eslint-disable-next-line @typescript-eslint/ban-types
            map = new Map<Symbol, NamedConvertedItem>();
            this.result.set(actionWithSymbol.item.kind, map);
        }
        map.set(actionWithSymbol.symbol, actionWithSymbol.item);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    getItem<T extends NamedConvertedItem>(kind: TypeKind, symbol: Symbol): T | undefined {

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

