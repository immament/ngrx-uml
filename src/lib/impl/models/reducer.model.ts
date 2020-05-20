import path from 'path';

import { ConvertedItem, NamedConvertedItem, TypeKind } from '../../core/converters/models';

import { Action } from './action.model';

export class Reducer implements NamedConvertedItem {

    readonly kind = TypeKind.Reducer;
    readonly kindText = 'Reducer';

    filePath?: string;
    actions?: Action[];
    name?: string;

    setName(name: string): void {
        this.name = name;
    }

    getExportName(): string {
        return  `${this.filePath && path.basename(this.filePath, '.ts')}_${this.name}`;
    }

    addAction(action: Action): void {
        if (!this.actions) {
            this.actions = [];
        }
        this.actions.push(action);
    }

    getChildren(): ConvertedItem[] {
        return this.actions || [];
    }

}