import { TypeArgument } from './converted-items/type-argument.model';
import { Property } from './property.model';
import { TypeKind } from './type-kind.enum';

export class TypeLiteral extends TypeArgument {
    readonly kind = TypeKind.TypeLiteral;
    kindText = 'TypeLiteral';
    constructor(public properties?: Property[]) {
        super();
    }
}
