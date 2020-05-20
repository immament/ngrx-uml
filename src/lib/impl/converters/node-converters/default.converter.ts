
import { isIdentifier, Node } from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import { NodeConverter } from '../../../core/converters/models/node.converter';
import { ConvertedItem, NamedType } from '../../../core/converters/models/type.model';
import { syntaxKindText } from '../../../utils/tsutils';

export class DefaultConverter extends NodeConverter {

    convert(_context: ConvertContext, node: Node): ConvertedItem | undefined {
       
        const name = isIdentifier(node) ? node.text : undefined;
        return new NamedType(syntaxKindText(node), name);
    }

    
}