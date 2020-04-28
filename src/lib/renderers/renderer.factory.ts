import { Renderer } from './renderer';

export interface RendererFactory {
    create(): Renderer;
}