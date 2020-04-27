import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import { Subject } from 'rxjs';

import { ConvertedItem, NamedConvertedItem } from '../converters/models';

import { ItemRenderer } from './item.renderer';

export interface RenderResult {
    name: string;
    result: string;
}
export class Renderer {

    private itemRenderedSubject = new Subject<{ item: ConvertedItem; output: string }>()

    onItemRendered = this.itemRenderedSubject.asObservable();


    constructor(
        private itemRenderers: { [kind: number]: ItemRenderer },
        private itemFilter?: (item: ConvertedItem) => boolean
    ) {

    }

    render(items: NamedConvertedItem[]): RenderResult[] | undefined {

        const outputs: RenderResult[] = [];
        for (const item of items) {

            const output = this.renderRecursive(item);
            if (output) {
                outputs.push({ name: item.name || this.randomName(), result: output.join(EOL)});
                this.itemRenderedSubject.next({ item, output: output.join(EOL) });
            }
        }

        if (outputs.length) {
            return outputs;
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
                outputs.push(output.join(EOL));
            }
            log.trace('render child:', chalk.green(child.kindText));

        });

        return outputs;


    }

    private randomName(): string {
        return Math.random().toString(36).substring(7);
    }
}