
import ts from 'typescript';

import { ConvertContext } from '../../../converters/convert.context';
import NodeConverter from '../../../converters/models/node.converter';
import { ConvertedItem, NamedType } from '../../../converters/models/type.model';
import { syntaxKindText } from '../../../utils/tsutils';

export class DefaultConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.Node): ConvertedItem | undefined {
       
        const name = ts.isIdentifier(node) ? node.text : undefined;
        return new NamedType(syntaxKindText(node), name);
    }

    
}