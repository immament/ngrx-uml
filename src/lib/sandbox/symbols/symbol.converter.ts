
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../core/converters';
import { NamedConvertedItem, TypeKind } from '../../core/converters/models';
import { NodeConverter } from '../../core/converters/node.converter';
import { printNode } from '../../utils/preparet-to-print';

export class SymbolConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.SourceFile): NamedConvertedItem | undefined {
        if (!node.symbol) {
            log.info('no symbol for', node.fileName);
            return;
        }
        const symbols = context.typeChecker.getExportsOfModule(node.symbol);
        if (symbols) {

            const item = {
                name: node.fileName,
                kindText: 'SourceFileSymbols',
                kind: TypeKind.Unknown,
                count: symbols.length,
                symbols: symbols.map(s=> context.typeChecker.getFullyQualifiedName(s))
            } as unknown as NamedConvertedItem;
            if(symbols.length) {
              //  log.info(printNode(node));

            }
            context.addResult({ symbol: node.symbol, item });
            return item;

        } else {
            log.info('no Symbols for', node.fileName);
            
        }
        return;
    }

}
