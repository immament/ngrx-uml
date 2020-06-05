import ts from 'typescript';

import { ConvertedItem, NamedConvertedItem, TypeKind } from '../../../core/converters/models';

export class RegisteredReducerItem  implements NamedConvertedItem {

    kind = TypeKind.RegisteredReducer;
    kindText  = 'RegisteredReducer';
    reducerSymbol?: ts.Symbol; 
    reducerItems?: RegisteredReducerItem[]; 

    constructor(
        public name: string,
        public filePath: string,
        public pos: number,
        public end: number,
    ) {
    }

    setName(_name: string): void {
        throw new Error('Method not implemented.');
    }

    getExportName(): string {
        throw new Error('Method not implemented.');
    }


    getChildren(): ConvertedItem[] {
       return [];
    }

}

export function isRegisteredReducerItem(object: unknown): object is RegisteredReducerItem {
    return (object as NamedConvertedItem).kind === TypeKind.RegisteredReducer;
}
