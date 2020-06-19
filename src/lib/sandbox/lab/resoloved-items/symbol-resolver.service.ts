import chalk from 'chalk';
import ts from 'typescript';

import { ConvertedItem } from '../../../core/converters/models';
import devLogger from '../../../utils/logger';

import { Reference } from './resolved-item.model';

export class SymbolResolveItem {
    item?: ConvertedItem;
    private references: Reference[] = [];

    constructor(
        public readonly fqn: string,
        public readonly symbol: ts.Symbol,
        reference?: Reference
    ) {
        if (reference) {
            this.references.push(reference);
        }
    }

    isResolved(): boolean {
        return !!this.item;
    }

    addReference(reference: Reference): void {
        this.references.push(reference);
    }
}
export interface SymbolResolverService {
    getItems(): SymbolResolveItem[];
    getItem(fqn: string): SymbolResolveItem | undefined;
    resolveItem(fqn: string, item: ConvertedItem): SymbolResolveItem;
    addSymbolToResolve(symbol: ts.Symbol, reference: Reference): SymbolResolveItem;
    addResolvedSymbol(symbol: ts.Symbol, item: ConvertedItem): SymbolResolveItem;
}

export class MemorySymbolResolverService implements SymbolResolverService {
    private toResolve = new Map<string, SymbolResolveItem>();
    constructor(private readonly typeChecker: ts.TypeChecker) {
    }
    addResolvedSymbol(symbol: ts.Symbol, convertedItem: ConvertedItem): SymbolResolveItem {
        devLogger.info('addResolvedSymbol');

        const fqn = this.typeChecker.getFullyQualifiedName(symbol);
        let resolveItem = this.getItem(fqn);
        if (!resolveItem) {
            resolveItem = new SymbolResolveItem(fqn, symbol);
            this.toResolve.set(fqn, resolveItem);
        }
        resolveItem.item = convertedItem;
        return resolveItem;
    }
    getItems(): SymbolResolveItem[] {
        return [...this.toResolve.values()];
    }

    getItem(fqn: string): SymbolResolveItem | undefined {
        if (this.toResolve.has(fqn)) {
            return this.toResolve.get(fqn);
        }
        return;
    }
    resolveItem(_fqn: string, _item: ConvertedItem): SymbolResolveItem {
        throw new Error('not implemented');
    }

    addSymbolToResolve(symbol: ts.Symbol, reference: Reference): SymbolResolveItem {
        devLogger.info(chalk.cyan('addSymbolToResolve'));

        const fqn = this.typeChecker.getFullyQualifiedName(symbol);
        let item = this.getItem(fqn);
        if (item) {
            item.addReference(reference);
            return item;
        }

        item = new SymbolResolveItem(fqn, symbol, reference);
        this.toResolve.set(fqn, item);
        return item;

    }

}