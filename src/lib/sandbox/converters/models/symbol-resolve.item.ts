import log from 'loglevel';
import ts from 'typescript';

import { ConvertedItem, TypeKind } from '../../../core/converters/models';
import { Reference } from '../../lab/resoloved-items/resolve-item.model';

const devLogger = log.getLogger('symbol-resolve');

export class SymbolResolveItem implements ConvertedItem {
    kind = TypeKind.SymbolResolveItem;
    kindText = 'SymbolResolve';

    // resolvedItem?: ConvertedItem;
    resolvedItems: ConvertedItem[] = [];
    readonly references: Reference[] = [];

    constructor(
        public readonly fqn: string,
        public readonly symbol: ts.Symbol,
        reference?: Reference
    ) {
        if (reference) {
            this.references.push(reference);
        }
    }

    getChildren(): ConvertedItem[] {
        return [];
    }

    get isResolved(): boolean {
        return this.resolvedItems.length > 0;
    }

    addReference(reference: Reference): void {
        this.references.push(reference);
    }

    addReferences(references: Reference[]): void {
        for (const reference of references) {
            this.references.push(reference);
        }
    }

    resolveReferences(convertedItem: ConvertedItem | ConvertedItem[]): void {
        for (const reference of this.references) {
            devLogger.debug(`  [${reference.item.kindText}] property: '${reference.propertyName}'`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyItem = reference.item as any;
            const itemProperty  = anyItem[reference.propertyName];

            if (Array.isArray(itemProperty)) {
                if(Array.isArray(convertedItem)) {
                    const symbolResolveItemIndex = itemProperty.indexOf(this);
                    if(symbolResolveItemIndex>=0) {
                        itemProperty.splice(symbolResolveItemIndex);
                    }
                    itemProperty.push(...convertedItem);
                } else {
                    itemProperty.push(convertedItem);
                }
            } else {
                anyItem[reference.propertyName] = convertedItem;
            }
        }
    }

}

export function isCombinedReducersItem(object: unknown): object is SymbolResolveItem {
    return (object as ConvertedItem).kind === TypeKind.SymbolResolveItem;
}
