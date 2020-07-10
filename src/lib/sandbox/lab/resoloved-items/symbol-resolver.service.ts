
import ts from 'typescript';

import { ConvertedItem, TypeKind } from '../../../core/converters/models';
import { SymbolResolveItem } from '../../converters/models/symbol-resolve.item';

import { Reference } from './resolve-item.model';

export interface SymbolResolverService {
    getItems(): SymbolResolveItem[];
    getItemByFqn(fqn: string): SymbolResolveItem | undefined;
    resolveItem(symbol: ts.Symbol): SymbolResolveItem | undefined;
    addSymbolToResolve(symbol: ts.Symbol, reference: Reference): SymbolResolveItem | undefined;
    addResolvedSymbol(symbol: ts.Symbol, item: ConvertedItem): SymbolResolveItem;
    resolveAll(): void;
    groupByKind(): Map<TypeKind, ConvertedItem[]>;
}