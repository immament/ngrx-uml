import { NamedConvertedItem } from '../';
import { RegisteredReducerItem } from '../../../../sandbox/converters/models/registered-reducer.item';
import { TypeKind } from '../type-kind.enum';

import { ConvertedItem } from './converted-item.model';

export class NgModule implements NamedConvertedItem {
    readonly kind = TypeKind.NgModule
    readonly kindText = 'NgModule';
    registeredReducers?: RegisteredReducerItem[];
    registeredItems: ConvertedItem[] = [];
    constructor(public name?: string,
        public filePath?: string,
        public pos?: number,
        public end?: number,
    ) {
    }

    getChildren(): ConvertedItem[] {
        return [];
    }

    setName(name: string): void {
        this.name = name;
    }

    getExportName(): string {
        return this.name || this.kindText;
    }

}

