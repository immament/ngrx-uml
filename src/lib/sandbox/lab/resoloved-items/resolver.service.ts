import ts from 'typescript';

import { ConvertedItem } from '../../../core/converters/models';
import { syntaxKindText } from '../../../utils';
import devLogger, { logColor } from '../../../utils/logger';

import { Reference, ResolveItem } from './resolved-item.model';

export interface ResolverService {
    getItem(node: ts.Node): ResolveItem | undefined;
    resolveItem(node: ts.Node, item: ConvertedItem): ResolveItem;
    addToResolve(node: ts.Node, reference: Reference): ResolveItem;
    getItems(): ResolveItem[];
}

export class MemoryResolverService implements ResolverService {

    private toResolve = new Map<ts.Node, ResolveItem>();

    constructor(private readonly typeChecker: ts.TypeChecker) {

    }

    getItem(_node: ts.Node): ResolveItem | undefined {
        return ;
    }

    resolveItem(_node: ts.Node, _item: ConvertedItem): ResolveItem {
        throw new Error('not implemented!');
    }



    addToResolve(node: ts.Node, reference: Reference): ResolveItem {
        devLogger.info(logColor.warn('addSymbolToResolve:'), syntaxKindText(node));
        if (this.toResolve.has(node)) {
            const item = this.toResolve.get(node);
            if (item) {
                item.addReference(reference);
                return item;
            }

        }

        const item = new ResolveItem(node, reference);
        this.toResolve.set(node, item);
        return item;

    }

    getItems(): ResolveItem[] {
        return [...this.toResolve.values()];
    }

}