

import { EOL } from 'os';

import { getFileName } from '../../utils/utils';
import { ActionReference } from './action-reference.model';
import { PlantItem } from './PlanItem';
import { Props } from './props.model';

export class Action implements PlantItem {
    variable?: string;
    filePath?: string;
    props?: Props[];
    references?: ActionReference[];
    type?: string;

    constructor(public readonly name: string) { }

    toPlantUml(withReferences = false): string {
        const propsText = this.propsToText();

        const fileName = getFileName(this.filePath);
        const srcText = fileName ? `src: ${fileName}` : '';

        let diagramContent = `interface "${this.name}" << (A,#FF7700) action >> {
            variable: ${this.variable}
            ${srcText}
            --
            ${propsText || ''}
        }
        
        `;
        if (withReferences) {
            diagramContent += this.referencesToPlantUml();
        }

        return diagramContent;

    }

    addReferece(reference: ActionReference): void {
        if(!this.references) {
            this.references = [];
        }
        this.references.push(reference);
    }

    private referencesToPlantUml(): string | undefined {
        if (this.references && this.references.length) {
            let diagramContent = '';
            for (const ref of this.references) {
                diagramContent += ref.toPlantUml() + this.linkToPlantUml(ref);
            }
            return diagramContent;
        }
        return;
    }

    private linkToPlantUml(ref: ActionReference): string {
        return `"${this.name}" ${ref.isCall? '-down->': '<.down.'} "${ref.fileName} ${ref.isCall? 'D': 'L'}"${EOL}`;
    }

    private propsToText(): string | undefined {
        return this.props && this.props.map(p => `${p.name}: ${p.type}`).join(EOL);
    }

}