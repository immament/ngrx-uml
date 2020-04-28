import ts from 'typescript';

import { NamedConvertedItem } from '../../converters/models';



export interface ItemWithSymbol {
    symbol: ts.Symbol;
    item: NamedConvertedItem;
}
