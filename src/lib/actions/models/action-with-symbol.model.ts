import ts from 'typescript';

import { Action } from './action.model';

export interface ActionWithSymbol {
    symbol: ts.Symbol;
    action: Action;
}
