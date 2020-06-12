import { ItemRenderer } from '../../../core/renderers/item.renderer';
import { getFileName } from '../../../utils/utils';
import { Reducer } from '../../models/reducer.model';

export class ReducerRenderer implements ItemRenderer {

    render(item: Reducer): string {
        return this.toPlantUml(item);
    }

    toPlantUml(item: Reducer): string {
        const fileName = getFileName(item.filePath);
        const srcText = fileName ? `src: ${fileName}` : '';

        const diagramContent = `interface "${item.name}" << (R,#0077FF) reducer >> {
            ${srcText}
            --
        }

        `;

        return diagramContent;
    }
} 