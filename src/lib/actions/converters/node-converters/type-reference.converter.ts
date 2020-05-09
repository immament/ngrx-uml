import ts from 'typescript';

import { ConvertContext } from '../../../converters/convert.context';
import { NodeConverter } from '../../../converters/models/node.converter';
import { ConvertedItem, TypeReference } from '../../../converters/models/type.model';

export class TypeReferenceConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        return new TypeReference(node.getText(node.getSourceFile()));
    }


}