import { RenderResult } from '../renderers';

export interface Output {
    transform(input: RenderResult[]): void;
}