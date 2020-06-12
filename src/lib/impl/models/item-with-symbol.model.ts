import ts from 'typescript';

import { NamedConvertedItem } from '../../core/converters/models';

export interface ItemWithSymbol {
    symbol: ts.Symbol;
    item: NamedConvertedItem;
}
