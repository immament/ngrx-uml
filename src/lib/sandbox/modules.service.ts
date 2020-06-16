import { Renderer } from '../core/renderers';
import { GeneratorOptions, GeneratorService } from '../services';

import { ModulesConvertContextFactory } from './converters/modules-context.factory';

export class ModulesService  {

    constructor(private options: GeneratorOptions) {}

    generate(filesPattern: string): Promise<void> {


        const generateService = new GeneratorService(
            [
                new ModulesConvertContextFactory,
            ],
            new Renderer({}),
            [],
            this.options
        );

        return generateService.generate(filesPattern);
    }
}