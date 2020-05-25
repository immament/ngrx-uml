import path from 'path';

import { ConvertedItem } from '../../core/converters/models/converted-items/converted-item.model';
import {
    NamedConvertedItem
} from '../../core/converters/models/converted-items/named-converted-item.model';
import { TypeKind } from '../../core/converters/models/type-kind.enum';

import { Action } from './action.model';

export interface Declaration {
    name?: string;
    kindText: string;
}
export class ActionReference implements NamedConvertedItem {

    kind = TypeKind.ActionReference;
    kindText = 'ActionReference';

    isCall?: boolean;
    action?: Action;
    filePath?: string;
    fileName?: string;
    documentation?: string;
    type?: string;
    declarationContext?: Declaration[];

    constructor(public name: string) { }

    setName(name: string): void {
        this.name = name; 
    }

    getExportName(): string {
        return  `${this.filePath && path.basename(this.filePath)}_${this.name}`;
    }

    getChildren(): ConvertedItem[] {
        return [];
    }

}