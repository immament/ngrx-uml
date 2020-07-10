import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem } from '../../../core/converters/models';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _ts from '../../../ts-internal';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import labUtils from '../lab-utils';

export abstract class KnownElement {

    static devLogger = log.getLogger('known-element');
    
    abstract postfixes: string[];

    abstract work(context: ConvertContext, node: ts.Node, symbol?: ts.Symbol): NamedConvertedItem | undefined;

    resolveParentSymbol(context: LabItemConvertContext, node: ts.Node, convertedItem: NamedConvertedItem): ts.Symbol | undefined {
        KnownElement.devLogger.info('+', labUtils.nodeText(node), 'parent:');
        const parentSymbol = this.findParentSymbol(node);
        if (parentSymbol) {
            KnownElement.devLogger.info('  parentSymbol for:', labUtils.nodeText(node), 'parent:', parentSymbol.escapedName);
            context.symbolResolverService.addResolvedSymbol(parentSymbol, convertedItem);
            convertedItem.parentSymbolName = parentSymbol.getEscapedName().toString();
            return parentSymbol;
        }

        KnownElement.devLogger.info('- no parentSymbol for:', labUtils.nodeText(node));
        return;
    }

    private findParentSymbol(node: ts.Node): ts.Symbol {
        const parent = node.parent;
        if (parent.symbol) {
            // devLogger.error('parent symbol');
            return parent.symbol;
        }
        if (parent.localSymbol) {
            // devLogger.error('parent localSymbol');
            return parent.localSymbol;
        }
        // devLogger.error('no parent symbol');

        return this.findParentSymbol(parent);
    }

    match(fullyQualifiedName: string): boolean {
        return this.postfixes.some(p => fullyQualifiedName.endsWith(p));
    }

}

