import ts from 'typescript';

import { ConvertContext } from '../convert-context';
import { ConvertedItem } from '../models/convertet-item.model';
import { Property, TypeLiteral } from '../models/type.model';
import NodeConverter from './node.converter';

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