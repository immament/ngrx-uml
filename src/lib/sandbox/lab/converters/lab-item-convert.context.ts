import { cyan } from 'chalk';
import { Program, Symbol, TypeChecker } from 'typescript';

import { ConvertContext, Converter } from '../../../core/converters';
import { NamedConvertedItem, TypeKind } from '../../../core/converters/models';
import { ItemWithSymbol } from '../../../impl/models';
import { getKeysReplacer, serializeConvertedItemsMapToJson } from '../../../utils';
import devLogger, { currentStackLevel, logColor } from '../../../utils/logger';
import labUtils from '../lab-utils';
import { MemorySymbolResolverService, SymbolResolverService } from '../resoloved-items/symbol-resolver.service';

export class LabItemConvertContext implements ConvertContext {

    private result: Map<TypeKind, Map<unknown, NamedConvertedItem>>;
    public readonly symbolResolverService: SymbolResolverService;


    constructor(
        public name: string,
        public program: Program,
        public typeChecker: TypeChecker,
        public converter: Converter,
        public rootKinds: TypeKind[],
        lastContext?: ConvertContext,
        private onFinish?: (context: LabItemConvertContext) => void
    ) {
        if (lastContext) {
            this.result = lastContext.getRawResult() as Map<TypeKind, Map<unknown, NamedConvertedItem>>;
        } else {
            this.result = new Map<TypeKind, Map<unknown, NamedConvertedItem>>();
        }

        this.symbolResolverService = new MemorySymbolResolverService(typeChecker);

    }

    // TODO: move to ?
    private resolveAll(): void {

        const resolveItems =  this.symbolResolverService.getItems();
        devLogger.info(cyan('resolveAll size: '),resolveItems.length);
        for (const entry of resolveItems) {
            if (!entry.isResolved()) {

                let item = labUtils.getItemRecursive(this.typeChecker, entry.symbol.valueDeclaration);
                devLogger.info(logColor.info('resolve item in loop'), currentStackLevel());
                
                if (item?.symbol && !item.item) {
                    devLogger.debug(logColor.info('resolve item in loop'));

                    const resolvedItem = this.symbolResolverService.getItem(this.typeChecker.getFullyQualifiedName(item.symbol));
                    if (!resolvedItem?.item) {

                        // item = labUtils.getItemRecursive(this.typeChecker, entry.symbol.valueDeclaration);
                    } else {
                        item = { item: resolvedItem.item };
                    }
                }
                devLogger.debug(logColor.info('resolved item'), item);
            }
        }

    }

    finish(): void {

        this.resolveAll();

        if (this.onFinish) {
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
        return serializeConvertedItemsMapToJson(this.getResult(), parent, getKeysReplacer(['action', 'reducerSymbol']));
    }

    isRootKind(kind: TypeKind): boolean {
        return this.rootKinds.includes(kind);
    }

}

