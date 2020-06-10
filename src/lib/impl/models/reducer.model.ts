import path from 'path';

import { ConvertedItem, NamedConvertedItem, TypeKind } from '../../core/converters/models';

import { Action } from './action.model';

export class Reducer implements NamedConvertedItem {

    readonly kind = TypeKind.Reducer;
    readonly kindText = 'Reducer';

    actions?: Action[];
    name?: string;

    constructor(
        public filePath: string,
        public pos: number,
        public end: number
    ) {}

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