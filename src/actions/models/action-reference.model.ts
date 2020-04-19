import { Action } from './action.model';
import { PlantItem } from './PlanItem';

export class ActionReference implements PlantItem {
    isCall?: boolean;
    action?: Action;
    filePath?: string;
    fileName?: string;
    documentation?: string;
    type?: string;

    constructor(public readonly name: string) { }

    toPlantUml(): string {

        const stereotyp = this.isCall ? '<< (D,orchid) dispatch >>' : '<< (L,orchid) listen >>';

        return `interface "${this.fileName} ${this.isCall ? 'D' : 'L'}" ${stereotyp} {
            name: ${this.name}
            action: ${this.action && this.action.name}
            ${this.fileName ? `src: ${this.fileName}` : ''}
            ..
        }
        `;
    }

}