import { ConvertedItem, TypeKind } from '../../../core/converters/models';

import { RegisteredReducerItem } from './registered-reducer.item';

export class CombineReducersItem implements ConvertedItem {

    kind = TypeKind.RegisteredReducer;
    kindText  = 'RegisteredReducer';
    reducers: RegisteredReducerItem[] = [];

    getChildren(): ConvertedItem[] {
        return this.reducers;
    }
}

export function isCombinedReducersItem(object: unknown): object is CombineReducersItem {
    return (object as ConvertedItem).kind === TypeKind.CombineReducers;
}
