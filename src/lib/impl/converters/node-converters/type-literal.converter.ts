import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import { ConvertedItem } from '../../../core/converters/models/converted-items/converted-item.model';
import { Property } from '../../../core/converters/models/property.model';
import { TypeLiteral } from '../../../core/converters/models/type-literal.model';
import { NodeConverter } from '../../../core/converters/node.converter';

export class TypeLiteralConverter extends NodeConverter {

    convert(_context: ConvertContext, node: ts.TypeLiteralNode): ConvertedItem | undefined {
        const properties = node.members
            .map((member) => ts.isPropertySignature(member) && this.propertySignatureToProperty(member))
            .filter(p => !!p) as Property[];
        return new TypeLiteral(properties);
    }

    private propertySignatureToProperty(property: ts.PropertySignature): Property {
        const sourceFile = property.getSourceFile();
        return {
            name: property.name.getText(sourceFile),
            type: property.type && property.type.getText(sourceFile)
        };
    }


}