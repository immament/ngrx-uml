import { TypeArgument } from './converted-items/type-argument.model';
import { TypeKind } from './type-kind.enum';

export class TypeReference extends TypeArgument {
    readonly kind = TypeKind.TypeReference;
    kindText = 'TypeReference';
    constructor(public name: string) {
        super();
    }
}
