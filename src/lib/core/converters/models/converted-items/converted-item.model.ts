import { TypeKind } from '../type-kind.enum';

export interface ConvertedItem {
    readonly kind: TypeKind;
    readonly kindText: string;
    getChildren(): ConvertedItem[];
}
