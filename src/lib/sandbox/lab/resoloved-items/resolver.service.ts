import chalk from 'chalk';
import ts from 'typescript';

import { ConvertedItem } from '../../../core/converters/models';
import devLogger from '../../../utils/logger';

import { Reference, ResolvedItem } from './resolved-item.model';

export interface ResolverService {
    toResolve:  Map<string, ResolvedItem>;
    getItem(fqn: string): ResolvedItem | undefined;
    resolveItem(fqn: string, item: ConvertedItem): ResolvedItem;
    addSymbolToResolve(symbol: ts.Symbol, reference: Reference): ResolvedItem;
}

export class MemoryResolverService implements ResolverService {


    toResolve = new Map<string, ResolvedItem>();

    constructor(private readonly typeChecker: ts.TypeChecker) {

    }

    getItem(_fqn: string): ResolvedItem | undefined {
        return;
    }
    resolveItem(_fqn: string, _item: ConvertedItem): ResolvedItem {
        throw new Error('not implemented');
    }

    addSymbolToResolve(symbol: ts.Symbol, reference: Reference): ResolvedItem {
        devLogger.info(chalk.cyan('addSymbolToResolve'));

        const fqn = this.typeChecker.getFullyQualifiedName(symbol);
        if (this.toResolve.has(fqn)) {
            const item = this.toResolve.get(fqn);
            if (item) {
                item.addReference(reference);
                return item;
            }

        }

        const item = new ResolvedItem(fqn, symbol, reference);
        this.toResolve.set(fqn, item);
        return item;

    }

}