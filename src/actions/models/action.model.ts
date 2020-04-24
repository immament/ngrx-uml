

import { ConvertedItem, NamedType, TypeKind } from '../../converters/models/type.model';
import { ActionReference } from './action-reference.model';

export class Action implements ConvertedItem {

    readonly kind = TypeKind.Action;
    readonly kindText = 'Action';

    variable?: string;
    filePath?: string;
    references?: ActionReference[];
    type?: string;
    createActionArgs?: NamedType[];

    constructor(public readonly name: string) { }

    addReferece(reference: ActionReference): void {
        if (!this.references) {
            this.references = [];
        }
        this.references.push(reference);
    }

    getChildren(): ConvertedItem[] {
        return this.references || [];
    }

}