import { TypeKind } from '../type-kind.enum';

import { ConvertedItem } from './converted-item.model';

export class NamedType implements ConvertedItem {
    readonly kind: TypeKind = TypeKind.Unknown;
    constructor(public readonly kindText: string, public readonly name?: string) {
    }
    getChildren(): ConvertedItem[] {
        return [];
    }
}
