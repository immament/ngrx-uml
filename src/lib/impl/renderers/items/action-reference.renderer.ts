import { EOL } from 'os';

import { ItemRenderer } from '../../../core/renderers/item.renderer';
import { ActionReference } from '../../models/action-reference.model';
import { Action } from '../../models/action.model';

export class ActionReferenceRenderer implements ItemRenderer {


    render(item: ActionReference): string {
        return this.toPlantUml(item);
    }

    private getName(item: ActionReference): string | undefined {
        const contextName =
            item.declarationContext ?
                item.declarationContext.map(dc => dc.name).find(name => !!name) || ''
                : '';

        return `${item.fileName}:: ${contextName} ${item.isCall ? 'D' : 'L' }`;
    }

    toPlantUml(item: ActionReference): string {

        const stereotyp = item.isCall ? '<< (D,orchid) dispatch >>' : '<< (L,orchid) listen >>';
        // ${item.fileName ? `src: ${item.fileName}` : ''}

        let content = `interface "${this.getName(item)}" ${stereotyp} {
            name: ${item.name}
            action: ${item.action && item.action.name}
            ..
            ${this.declarationContext(item) || ''}
            __
        }
        `;

        if (item.action) {
            content += this.linkToPlantUml(item.action, item);
        }
        return content;
    }

    private linkToPlantUml(action: Action, ref: ActionReference): string {
        return `"${action.name}" ${ref.isCall ? '-down->' : '<.down.'} "${this.getName(ref)}"${EOL}`;
    }

    private declarationContext(item: ActionReference): string | undefined {
        if (item.declarationContext) {
            return item.declarationContext
                .map(dc => `${dc.kindText.replace('Declaration', '')}: ${dc.name || ''}`)
                .join(EOL);
        }
        return;
    }


} 