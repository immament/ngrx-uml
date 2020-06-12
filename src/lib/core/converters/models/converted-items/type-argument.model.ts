import { TypeKind } from '../type-kind.enum';

import { ConvertedItem } from './converted-item.model';

export class TypeArgument implements ConvertedItem {
    readonly kind = TypeKind.TypeArgument;
    kindText = 'TypeArgument';
    getChildren(): ConvertedItem[] {
        return [];
    }
}
