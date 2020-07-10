import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { ConvertedItem, NamedConvertedItem } from '../../../core/converters/models';
import { NodeConverter } from '../../../core/converters/node.converter';

import { KnownElement } from './known-element.model';

export class KnownElementWithConverter extends KnownElement {


    constructor(
        public readonly postfixes: string[],
        private converters: NodeConverter[]
    ) { super(); }

    work(context: ConvertContext, node: ts.Node): NamedConvertedItem | undefined {
        let convertedItem: ConvertedItem | undefined;
        for (const nodeConverter of this.converters) {
            convertedItem = nodeConverter.convert(context, node);
            if (convertedItem) {
                break;
            }
        }

        return convertedItem as NamedConvertedItem;

    }

}
