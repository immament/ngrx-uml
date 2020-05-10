import chalk from 'chalk';
import log from 'loglevel';
import { EOL } from 'os';
import { Observable, Subject } from 'rxjs';

import { ConvertedItem, NamedConvertedItem, TypeKind } from '../converters/models';

import { ItemRenderer } from './item.renderer';

export type RenderersMap = { [kind: number]: ItemRenderer };

export interface RenderResult {
    name: string;
    result: string;
}

export type ItemRenderedEventArg = { item: ConvertedItem; output: string };

export class Renderer {

    private itemRenderedSubject = new Subject<ItemRenderedEventArg>()

    private _onItemRendered = this.itemRenderedSubject.asObservable();
    public get onItemRendered(): Observable<ItemRenderedEventArg> {
        return this._onItemRendered;
    }

    constructor(
        private itemRenderers: { [kind: number]: RenderersMap },
        private itemFilter?: (item: ConvertedItem) => boolean
    ) { }

    render(collections: Map<TypeKind, NamedConvertedItem[]>): RenderResult[] | undefined {

        const outputs: RenderResult[] = [];

        for (const [kind, items] of collections) {

            const kindRenderers = this.itemRenderers[kind];
            if (!kindRenderers) {
                log.warn('No renderer for kind', TypeKind[kind]);
                continue;
            }
            for (const item of items) {
                const output = this.renderRecursive(item, kindRenderers);
                if (output) {
                    outputs.push({ name: item.getExportName() || this.randomName(), result: output.join(EOL) });
                    this.itemRenderedSubject.next({ item, output: output.join(EOL) });
                }
            }
        }

        if (outputs.length) {
            return outputs;
        }

    }

    private renderItem(item: ConvertedItem, renderers: RenderersMap): string | undefined {
        if (renderers[item.kind]) {
            return renderers[item.kind].render(item);
        }
    }


    private renderRecursive(item: ConvertedItem, renderers: RenderersMap): string[] | undefined {
        const outputs: string[] = [];
        if (!this.itemFilter || this.itemFilter(item)) {

            const output = this.renderItem(item, renderers);
            if (output) {
                outputs.push(output);
            }
        }


        item.getChildren().forEach(child => {

            const output = this.renderRecursive(child, renderers);
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