
import ts from 'typescript';

import { ConvertedItem } from '../../../core/converters/models';

export interface Reference {
    item: ConvertedItem;
    propertyName: string;
    addToArray?: boolean;
}

export class ResolveItem {

    item?: ConvertedItem;
    private references: Reference[] = [];

    constructor(public node: ts.Node, reference?: Reference) { 
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