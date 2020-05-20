

import {
    ConvertedItem, NamedConvertedItem, NamedType, TypeKind
} from '../../core/converters/models/type.model';

import { ActionReference } from './action-reference.model';

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