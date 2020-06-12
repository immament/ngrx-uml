
import { TypeKind } from '../../core/converters/models';
import { Renderer } from '../../core/renderers';
import { RendererFactory } from '../../core/renderers/renderer.factory';

import { ActionReferenceRenderer, ActionRenderer } from './items';

export class ActionsPlantDiagramRenderFactory implements RendererFactory {
    create(): Renderer {
        return new Renderer({
            [TypeKind.Action]: {
                [TypeKind.Action]: new ActionRenderer,
                [TypeKind.ActionReference]: new ActionReferenceRenderer,
            },
            [TypeKind.Reducer]: {
                [TypeKind.Action]: new ActionRenderer,
                [TypeKind.ActionReference]: new ActionReferenceRenderer,
            }
        });

    }

}