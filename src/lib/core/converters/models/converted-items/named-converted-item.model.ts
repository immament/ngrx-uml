import { ConvertedItem } from './converted-item.model';

export interface NamedConvertedItem extends ConvertedItem {
    name?: string;
    filePath?: string;
    pos?: number;
    end?: number;
    setName(name: string): void;
    getExportName(): string;
}
