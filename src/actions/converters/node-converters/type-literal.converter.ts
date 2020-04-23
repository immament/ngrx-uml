import ts from 'typescript';

import { ConvertContext } from '../../../converters/convert.context';
import { ConvertedItem } from '../../../converters/models/convertet-item.model';
import NodeConverter from '../../../converters/models/node.converter';
import { Property, TypeLiteral } from '../../../converters/models/type.model';

export class TypeLiteralConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.TypeLiteralNode): ConvertedItem | undefined {
        const properties = node.members.map((member) => {
            if (ts.isPropertySignature(member)) {
                return this.propertySignatureToProperty(member);
            }
        }).filter(p => !!p) as Property[];
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