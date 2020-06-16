import ts from 'typescript';

import { ConvertedItem } from '../../../core/converters/models';

export interface Reference {
    item: ConvertedItem;
    propertyName: string;
}

export class ResolvedItem {

    item?: ConvertedItem;
    private references: Reference[] = [];

    constructor(public fqn: string, public symbol: ts.Symbol, reference?: Reference) { 
        if(reference) {
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