
import { isIdentifier, Node } from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import {
    ConvertedItem
} from '../../../core/converters/models/converted-items/converted-item.model';
import { NamedType } from '../../../core/converters/models/converted-items/named-type.model';
import { NodeConverter } from '../../../core/converters/node.converter';
import { syntaxKindText } from '../../../utils/tsutils';

export class DefaultConverter extends NodeConverter {

    convert(_context: ConvertContext, node: Node): ConvertedItem | undefined {
       
        const name = isIdentifier(node) ? node.text : undefined;
        return new NamedType(syntaxKindText(node), name);
    }

    
}