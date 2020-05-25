import {
    ActionsPlantDiagramRenderFactory
} from '../impl/renderers/actions-plant-diagram-renderer.factory';
import { GeneratorOptions, GeneratorService } from '../services';

import { SandboxConvertContextFactory } from './converters/sandbox-context.factory';

export class ModuleService  {

    constructor(private options: GeneratorOptions) {}

    generate(filesPattern: string): Promise<void> {


        const generateService = new GeneratorService(
            [
                new SandboxConvertContextFactory,
            ],
            new ActionsPlantDiagramRenderFactory().create(),
            [],
            this.options
        );

        return generateService.generate(filesPattern);
    }
}