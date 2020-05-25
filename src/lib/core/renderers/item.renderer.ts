import { ConvertedItem } from '../converters/models';

export interface ItemRenderer {
    render(item: ConvertedItem): string;
} 