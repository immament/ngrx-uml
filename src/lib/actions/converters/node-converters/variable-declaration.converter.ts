import ts from 'typescript';

import { ConvertContext } from '../../../converters';
import { NamedConvertedItem } from '../../../converters/models';
import { NodeConverter } from '../../../converters/models/node.converter';
import { ItemWithSymbol } from '../../models';

export class VariableDeclarationConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.VariableDeclaration): NamedConvertedItem | undefined {
        const sourceFile = node.getSourceFile();
        const initializer = node.initializer;
        if (!initializer || !ts.isCallExpression(initializer)) {
            return;
        }

        const item = context.converter.convertNode(context, initializer) as NamedConvertedItem;

        if (item && context.isRootKind(item.kind)) {
            const symbol = context.typeChecker.getSymbolAtLocation(node.name);
            if (symbol) {
                item.setName(node.name.getText(sourceFile));
                item.filePath = sourceFile.fileName;
                context.addResult({ symbol, item } as ItemWithSymbol);
            }
            return item;
        }

    }



}