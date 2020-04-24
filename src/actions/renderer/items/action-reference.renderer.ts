import { EOL } from 'os';

import { ActionReference } from '../../../action-references/models/action-reference.model';
import { Action } from '../../models/action.model';
import { ItemRenderer } from './item.renderer';

export class ActionReferenceRenderer implements ItemRenderer {


    render(item: ActionReference): string  {
        return this.toPlantUml(item);
    }

    toPlantUml(item: ActionReference): string {

        const stereotyp = item.isCall ? '<< (D,orchid) dispatch >>' : '<< (L,orchid) listen >>';

        let content = `interface "${item.fileName} ${item.isCall ? 'D' : 'L'}" ${stereotyp} {
            name: ${item.name}ng 
            action: ${item.action && item.action.name}
            ${item.fileName ? `src: ${item.fileName}` : ''}
            ..
        }
        `;

        if (item.action) {
            content += this.linkToPlantUml(item.action, item);
        }
        return content;
    }

    private linkToPlantUml(item: Action, ref: ActionReference): string {
        return `"${item.name}" ${ref.isCall ? '-down->' : '<.down.'} "${ref.fileName} ${ref.isCall ? 'D' : 'L'}"${EOL}`;
    }


} 