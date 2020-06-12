import { TypeKind } from '../type-kind.enum';

import { ConvertedItem } from './converted-item.model';
import { NamedConvertedItem } from './named-converted-item.model';
import { TypeArgument } from './type-argument.model';

export class CallExpression implements NamedConvertedItem {
    readonly kind = TypeKind.CallExpression;
    kindText = 'CallExpression';
    createdVariableName?: string;
    filePath?: string | undefined;
    constructor(public name?: string, public typeArguments?: TypeArgument[]) {
    }
    getChildren(): ConvertedItem[] {
        return [];
    }
    getExportName(): string {
        return this.name || this.kindText;
    }
    setName(name: string): void {
        this.createdVariableName = name;
    }
}
