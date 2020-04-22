import ts from 'typescript';

import { ConvertContext } from '../convert-context';
import { ConvertedItem } from '../models/convertet-item.model';
import { TypeReference } from '../models/type.model';
import NodeConverter from './node.converter';

export class TypeReferenceConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        return new TypeReference(node.getText(node.getSourceFile()));
    }


}