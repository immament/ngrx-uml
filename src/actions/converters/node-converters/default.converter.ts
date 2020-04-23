
import ts from 'typescript';

import { syntaxKindText } from '../../../utils/tsutils';
import { ConvertedItem } from '../../models/convertet-item.model';
import { NamedType } from '../../models/type.model';
import { ConvertContext } from '../convert.context';
import NodeConverter from './node.converter';

export class DefaultConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.Node): ConvertedItem | undefined {
       
        const name = ts.isIdentifier(node) ? node.text : undefined;
        return new NamedType(syntaxKindText(node), name);
    }

    
}