import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import {
    ConvertedItem
} from '../../../core/converters/models/converted-items/converted-item.model';
import { TypeReference } from '../../../core/converters/models/type-reference.model';
import { NodeConverter } from '../../../core/converters/node.converter';

export class TypeReferenceConverter extends NodeConverter {

    convert(_context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        return new TypeReference(node.getText(node.getSourceFile()));
    }


}