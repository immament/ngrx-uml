
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertedItem, TypeKind } from '../../../core/converters/models';
import { SymbolResolveItem } from '../../converters/models/symbol-resolve.item';
import labUtils from '../lab-utils';

import { Reference } from './resolve-item.model';
import { SymbolResolverService } from './symbol-resolver.service';

const logger = log.getLogger('symbol-resolve');

export class MemorySymbolResolverService implements SymbolResolverService {
    private toResolve = new Map<string, SymbolResolveItem>();
    constructor(private readonly typeChecker: ts.TypeChecker) {
    }

    addResolvedSymbol(symbol: ts.Symbol, convertedItem: ConvertedItem): SymbolResolveItem {
        logger.info(`+ [${convertedItem.kindText}]`);

        if (symbol.flags & ts.SymbolFlags.AliasExcludes) {
            throw Error('AliasExcludes');
            //  symbol = this.typeChecker.getAliasedSymbol(symbol);

        }

        const fqn = labUtils.getFullyQualifiedName(symbol, this.typeChecker);

        // if (symbol.flags & ts.SymbolFlags.AliasExcludes) {
        //     devLogger.error('  parentSymbol aliased', fqn);
        // }        
        // devLogger.error('  parentSymbol 2 ', fqn,  tsutils.symbolFlagsToString(symbol.flags));

        let resolveItem = this.getItemByFqn(fqn);
        if (!resolveItem) {
            resolveItem = new SymbolResolveItem(fqn, symbol);

            this.toResolve.set(fqn, resolveItem);
        } else {
            logger.warn('already exists:', resolveItem.fqn, convertedItem.kindText);
            if (resolveItem.isResolved) {
                return resolveItem;
            }
        }

        resolveItem.resolvedItems.push(convertedItem);
        return resolveItem;
    }


    getItems(): SymbolResolveItem[] {
        return [...this.toResolve.values()];
    }

    getItemByFqn(fqn: string): SymbolResolveItem | undefined {
        if (this.toResolve.has(fqn)) {
            return this.toResolve.get(fqn);
        }
        return;
    }



    resolveItem(symbol: ts.Symbol): SymbolResolveItem | undefined {

        logger.info('+', symbol.escapedName);

        if (symbol.flags & ts.SymbolFlags.AliasExcludes) {
            logger.info('AliasExcludes');
            //return;
            //throw new Error('AliasExcludes');
            //symbol = this.typeChecker.getAliasedSymbol(symbol);
        }

        const fqn = labUtils.getFullyQualifiedName(symbol, this.typeChecker);

        let resolveItem = this.getItemByFqn(fqn);
        if (!resolveItem) {
            if (labUtils.isFqnFromExternalLibrary(fqn)) {
                logger.warn('  symbol FROM node_modules', fqn);
                return;
            }
            resolveItem = new SymbolResolveItem(fqn, symbol);
            this.toResolve.set(fqn, resolveItem);
        }
        return resolveItem;
    }

    addSymbolToResolve(symbol: ts.Symbol, reference: Reference): SymbolResolveItem | undefined {

        if (symbol.flags & ts.SymbolFlags.AliasExcludes) {
            // symbol = this.typeChecker.getAliasedSymbol(symbol);
            return;
        }

        const fqn = labUtils.getFullyQualifiedName(symbol, this.typeChecker);
        if (labUtils.isFqnFromExternalLibrary(fqn)) {
            logger.warn('FROM node_modules', fqn);
        }
        let item = this.getItemByFqn(fqn);
        if (item) {
            item.addReference(reference);
            return item;
        }

        item = new SymbolResolveItem(fqn, symbol, reference);

        this.toResolve.set(fqn, item);
        return item;

    }


    groupByKind(): Map<TypeKind, ConvertedItem[]> {
        const resolveItems = this.getItems();
        return resolveItems.reduce((map, sr: SymbolResolveItem) => {

            for (const item of sr.resolvedItems) {
                let mapItem = map.get(item.kind);
                if (!mapItem) {
                    mapItem = [];
                    map.set(item.kind, mapItem);
                }
                mapItem.push(item);
            }


            return map;

        }, new Map<TypeKind, ConvertedItem[]>());

    }


    resolveAll(): void {
        const resolveItems = this.getItems();
        log.info('resolveAll size: ', resolveItems.length);

        for (const entry of resolveItems) {
            if (!entry.isResolved) {

                this.resolveSymbolItem(entry);
            }

        }

    }


    private resolveSymbolItem(entry: SymbolResolveItem): void {
        logger.warn('+ RESOLVE:' + entry.fqn);

        const resolveItems = this.resolveSymbolRecusive(entry.symbol);

        if (!resolveItems) {
            logger.error('  NOT RESOLVED:', entry.fqn);
            return;
        }

        for (const childItem of resolveItems) {
            this.resolveSymbolItemUsingChild(entry, childItem);
        }

    }

    private resolveSymbolItemUsingChild(entry: SymbolResolveItem, childResolveItem: SymbolResolveItem): void {
        if (childResolveItem.isResolved) {
            logger.info('  Resolved by another resolver:', entry.symbol.escapedName);
            entry.resolvedItems.push(...childResolveItem.resolvedItems);
            entry.resolveReferences(childResolveItem.resolvedItems);
        } else {
            logger.info('  Register references to another resolver:', childResolveItem.kindText);
            childResolveItem.addReferences(entry.references);
        }
    }

    private resolveSymbolRecusive(symbol: ts.Symbol): SymbolResolveItem[] | undefined {
        logger.info('+ symbol.escapedName:', symbol.escapedName, !symbol.valueDeclaration ? chalk.red('aliased: ' + !!(symbol.flags & ts.SymbolFlags.AliasExcludes)) : '');

        while (symbol.flags & ts.SymbolFlags.AliasExcludes) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
        }

        const symbolFqn = labUtils.getFullyQualifiedName(symbol, this.typeChecker);
        logger.debug('symbol.escapedName:', symbolFqn);

        if (!symbol || labUtils.isFqnFromExternalLibrary(symbolFqn)) {
            logger.info('external');
            return;
        }

        if (symbolFqn === 'unknown') {
            return;
        }

        const childSymbol = labUtils.getReturnedChildRecursive(this.typeChecker, symbol.valueDeclaration);

        if (!childSymbol) {
            logger.info('  child is undefined', symbol.escapedName);
            return;
        }
        return this.resolveSymbolsArray(childSymbol);
    }

    private resolveSymbolsArray(symbols: ts.Symbol[]): SymbolResolveItem[] | undefined {
        const arrayResult: SymbolResolveItem[] = [];
        for (const symbol of symbols) {
            this.resolveSymbol(symbol, arrayResult);
        }
        return arrayResult.length > 0 ? arrayResult : undefined;

    }


    private resolveSymbol(symbol: ts.Symbol, arrayResult: SymbolResolveItem[]): void {
        const resolvedItem = this.getItemByFqn(labUtils.getFullyQualifiedName(symbol, this.typeChecker));
        if (resolvedItem) {
            arrayResult.push(resolvedItem);
            return;
        }

        const resolvedSymbol = this.resolveSymbolRecusive(symbol);
        if (resolvedSymbol) {
            arrayResult.push(...resolvedSymbol);
        }
    }
}