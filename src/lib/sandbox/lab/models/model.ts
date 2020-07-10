import { ConvertedItem, NamedConvertedItem } from '../../../core/converters/models';

export type NamedConvertedItemWithChild = NamedConvertedItem & { childs: ConvertedItem[] };