

import { ConvertedItem } from '../../core/converters/models/converted-items/converted-item.model';
import { NamedConvertedItem } from '../../core/converters/models/converted-items/named-converted-item.model';
import { NamedType } from '../../core/converters/models/converted-items/named-type.model';
import { TypeKind } from '../../core/converters/models/type-kind.enum';

import { ActionReference } from './action-reference.model';

export class Action implements NamedConvertedItem {

    readonly kind = TypeKind.Action;
    readonly kindText = 'Action';

    variable?: string;
    references?: ActionReference[];
    type?: string;
    createActionArgs?: NamedType[];

    constructor(
        public readonly name: string,
        public readonly filePath: string,
        public readonly pos: number,
        public readonly end: number
    ) { }

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