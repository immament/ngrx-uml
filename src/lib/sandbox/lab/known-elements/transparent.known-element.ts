import ts from 'typescript';

import { NamedConvertedItem, TypeKind } from '../../../core/converters/models';
import { SymbolResolveItem } from '../../converters/models/symbol-resolve.item';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import labUtils from '../lab-utils';
import { NamedConvertedItemWithChild } from '../models/model';

import { KnownElement } from './known-element.model';

export class TransparentKnownElement extends KnownElement {
    constructor(
        public readonly postfixes: string[],
        public readonly mapToKind: TypeKind,
        public readonly mapToKindText?: string,

    ) {
        super();
    }

    work(context: LabItemConvertContext, node: ts.Node, symbol: ts.Symbol): NamedConvertedItem | undefined {
        TransparentKnownElement.devLogger.info('+', TypeKind[this.mapToKind], labUtils.nodeText(node));

        const convertedItem = {
            kind: this.mapToKind,
            kindText: this.mapToKindText || TypeKind[this.mapToKind],
            filePath: node.getSourceFile().fileName,
            pos: node.pos,
            end: node.end,
            name: symbol.name,
            childs: []
        } as unknown as NamedConvertedItemWithChild;

        // context.converter.getResolvedItem(context, node, -1);

        if (ts.isCallExpression(node)) {

            TransparentKnownElement.devLogger.info('isCallExpression', TypeKind[this.mapToKind]);

            this.parseArguments(context, node.arguments, convertedItem);
        }

        this.resolveParentSymbol(context, node, convertedItem);

        return convertedItem;
    }


    private parseArguments(context: LabItemConvertContext, args: ts.NodeArray<ts.Expression>, convertedItem: NamedConvertedItemWithChild): void {

        if (args.length === 0) {
            TransparentKnownElement.devLogger.warn('No NgModule decorator arguments');
            return;
        }
        for (const arg of args) {
            this.parseArgument(context, arg, convertedItem);
        }

    }

    private parseArgument(context: LabItemConvertContext, arg: ts.Expression, convertedItem: NamedConvertedItemWithChild): void {

        const resolved = context.converter.getResolvedItem(context, arg);

        if (!resolved) {
            TransparentKnownElement.devLogger.warn('- arguments not resolved');
            return;
        }

        for (const resolveItem of resolved) {

            switch (resolveItem.kind) {
                case TypeKind.SymbolResolveItem: {
                    const symbolResolveItem = resolveItem as SymbolResolveItem;
                    symbolResolveItem.addReference({ item: convertedItem, propertyName: 'childs', addToArray: true });
                    break;
                }
                default:
                    convertedItem.childs.push(resolveItem);
                    break;
            }
        }
    }

}
