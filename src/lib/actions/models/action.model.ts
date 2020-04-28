

import { ActionReference } from '../../action-references/models/action-reference.model';
import {
    ConvertedItem, NamedConvertedItem, NamedType, TypeKind
} from '../../converters/models/type.model';

export class Action implements NamedConvertedItem {

    readonly kind = TypeKind.Action;
    readonly kindText = 'Action';

    variable?: string;
    filePath?: string;
    references?: ActionReference[];
    type?: string;
    createActionArgs?: NamedType[];

    constructor(public readonly name: string) { }

    setName(variableName: string): void {
        this.variable = variableName;
    }

    getExportName(): string {
        return this.name;
    }

    addReference(reference: ActionReference): void {
        if (!this.references) {
            this.references = [];
        }
        this.references.push(reference);
    }

    getChildren(): ConvertedItem[] {
        return this.references || [];
    }

}