import { ConvertedItem } from '../../../converters/models/type.model';

export interface ItemRenderer {
    render(item: ConvertedItem): string;
} 