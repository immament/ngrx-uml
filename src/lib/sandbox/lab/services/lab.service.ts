import { GeneratorOptions, GeneratorService, Renderer } from '../../../..';
import { LabConvertContextFactory } from '../converters/lab-convert-context.factory';

export class LabService {

    constructor(private options: GeneratorOptions) { }

    generate(filesPattern: string): Promise<void> {

        const generateService = new GeneratorService(
            [new LabConvertContextFactory],
            new Renderer({}),
            [],
            this.options
        );

        return generateService.generate(filesPattern);
    }

}
