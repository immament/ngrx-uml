import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem, TypeArgument, TypeKind } from '../../../core/converters/models';
import { SymbolResolveItem } from '../../converters/models/symbol-resolve.item';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import labUtils from '../lab-utils';
import { NamedConvertedItemWithChild } from '../models/model';

import { KnownElement } from './known-element.model';

export interface SimpleKnownElementOptions {
    readonly withArgs?: boolean | number[];
    readonly withTypeArgs?: boolean;
}

export class SimpleKnownElement extends KnownElement {

    constructor(
        public readonly postfixes: string[],
        public readonly mapToKind: TypeKind,
        public readonly options: SimpleKnownElementOptions = {},
        matchFn?: (fullyQualifiedName: string) => boolean
    ) {
        super();
        if(matchFn) {
            this.match = matchFn;
        }
    }

    work(context: LabItemConvertContext, node: ts.Node, symbol?: ts.Symbol): NamedConvertedItem | undefined {
        SimpleKnownElement.devLogger.info('+', TypeKind[this.mapToKind], labUtils.nodeText(node), node.getSourceFile().fileName);

        const convertedItem = this.createConvertedItem(context, node, symbol);

        this.resolveParentSymbol(context, node, convertedItem);
        this.extractArguments(context, node, convertedItem);


        SimpleKnownElement.devLogger.info('-', TypeKind[this.mapToKind]);
        return convertedItem;
    }



    protected extractArguments(context: LabItemConvertContext, node: ts.Node, convertedItem: NamedConvertedItemWithChild): void {
        if (ts.isCallExpression(node)) {
            if (this.options.withTypeArgs) {
                SimpleKnownElement.devLogger.debug('withTypeArgs');

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (convertedItem as any).typeArgs = this.extractTypeArguments(context, node);
            }

            if (this.options.withArgs) {
                this.parseArguments(context, node.arguments, convertedItem);
            }
        }
    }

    protected createConvertedItem(_context: LabItemConvertContext, node: ts.Node, symbol?: ts.Symbol): NamedConvertedItemWithChild {
        return {
            kind: this.mapToKind,
            kindText: TypeKind[this.mapToKind],
            filePath: node.getSourceFile().fileName,
            pos: node.pos,
            end: node.end,
            name: symbol?.name || 'NO_SYMBOL',
            parentSymbolName: undefined,
            fqn: symbol ? _context.typeChecker.getFullyQualifiedName(symbol) : undefined,
            childs: [],
        } as unknown as NamedConvertedItemWithChild;
    }


    private parseArguments(context: LabItemConvertContext, args: ts.NodeArray<ts.Expression>, convertedItem: NamedConvertedItemWithChild): void {
        SimpleKnownElement.devLogger.info('++++++++++', TypeKind[this.mapToKind]);

        if (args.length === 0) {
            SimpleKnownElement.devLogger.warn('- No arguments');
            return;
        }

        if (Array.isArray(this.options.withArgs)) {
            for (const indexToParse of this.options.withArgs) {
                if (args.length > indexToParse) {
                    this.parseArgument(context, args[indexToParse], convertedItem);
                }
            }
        } else {
            for (const arg of args) {
                this.parseArgument(context, arg, convertedItem);
            }
        }


    }

    private parseArgument(context: LabItemConvertContext, arg: ts.Expression, convertedItem: NamedConvertedItemWithChild): void {
        SimpleKnownElement.devLogger.info('+', TypeKind[this.mapToKind], '- arg:', labUtils.nodeText(arg));

        const resolved = context.converter.getResolvedItem(context, arg);
        SimpleKnownElement.devLogger.info('  resolved', TypeKind[this.mapToKind], resolved?.map(r => r.kindText ));

        if (!resolved) {
            SimpleKnownElement.devLogger.warn('- arguments not resolved.', TypeKind[this.mapToKind]);
            return;
        }

        for (const resolveItem of resolved) {

            switch (resolveItem.kind) {
                case TypeKind.SymbolResolveItem: {
                    const symbolResolveItem = resolveItem as SymbolResolveItem;
                    convertedItem.childs.push(symbolResolveItem);
                    symbolResolveItem.addReference({ item: convertedItem, propertyName: 'childs', addToArray: true });
                    SimpleKnownElement.devLogger.info('- SymbolResolveItem', labUtils.nodeText(arg), symbolResolveItem.fqn);
                    break;
                }
                default:
                    convertedItem.childs.push(resolveItem);
                    SimpleKnownElement.devLogger.info('- resolved item:', resolveItem.kindText, convertedItem.name);
                    break;
            }
        }

    }

    private extractTypeArguments(context: ConvertContext, callExpression: ts.CallExpression): TypeArgument[] | undefined {

        const typeArguments = [];

        if (callExpression.typeArguments) {
            for (const typeArgument of callExpression.typeArguments) {
                const convertedTypeArgument = context.converter.convertNode(context, typeArgument, true);
                if (convertedTypeArgument instanceof TypeArgument) {
                    typeArguments.push(convertedTypeArgument);
                }
            }
        }
        return typeArguments;
    }


}
