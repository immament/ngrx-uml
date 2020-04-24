import { Action } from '../../actions/models/action.model';
import { ConvertedItem, TypeKind } from '../../converters/models/type.model';

export interface Declaration {
    name?: string;
    kindText: string;
}
export class ActionReference implements ConvertedItem {

    kind = TypeKind.ActionReference;
    kindText = 'ActionReference';

    isCall?: boolean;
    action?: Action;
    filePath?: string;
    fileName?: string;
    documentation?: string;
    type?: string;
    declarationContext?: Declaration[];

    constructor(public readonly name: string) { }

    toPlantUml(): string {

        const stereotyp = this.isCall ? '<< (D,orchid) dispatch >>' : '<< (L,orchid) listen >>';

        return `interface "${this.fileName} ${this.isCall ? 'D' : 'L'}" ${stereotyp} {
            name: ${this.name}ng 
            action: ${this.action && this.action.name}
            ${this.fileName ? `src: ${this.fileName}` : ''}
            ..
        }
        `;
    }

    getChildren(): ConvertedItem[] {
        return [];
    }

}