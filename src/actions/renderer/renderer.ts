import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import { Subject } from 'rxjs';

import { ConvertedItem } from '../../converters/models/type.model';

import { ItemRenderer } from './items/item.renderer';

export class Renderer {

    private itemRenderedSubject = new Subject<{ item: ConvertedItem; output: string }>()

    onItemRendered = this.itemRenderedSubject.asObservable();


    constructor(
        private itemRenderers: { [kind: number]: ItemRenderer },
        private itemFilter?: (item: ConvertedItem) => boolean
    ) {
  
    }

    render(items: ConvertedItem[]): string | undefined {

        const outputs: string[] = [];
        for (const item of items) {

            const output = this.renderRecursive(item);
            outputs.push(...output);
            if (output) {
                this.itemRenderedSubject.next({ item, output: output.join(EOL) });
            }
        }

        if (outputs.length) {
            return outputs.join(EOL);
        }

    }

    renderItem(item: ConvertedItem): string | undefined {
        if (this.itemRenderers[item.kind]) {
            return this.itemRenderers[item.kind].render(item);
        }
    }


    renderRecursive(item: ConvertedItem): string[] | undefined {
        const outputs: string[] = [];
        if (!this.itemFilter || this.itemFilter(item)) {

            const output = this.renderItem(item);
            if (output) {
                outputs.push(output);
            }
        }


        item.getChildren().forEach(child => {

            const output = this.renderRecursive(child);
            if (output) {
                outputs.push(...output);
            }
            log.trace('render child:', chalk.green(child.kindText));

        });

        return outputs;


    }
}