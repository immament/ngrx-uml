import { GeneratorOptions, GeneratorService, Renderer } from '../../../..';
import { Lab2ConvertContextFactory } from '../converters/lab2-convert-context.factory';

export class Lab2Service {

    constructor(private options: GeneratorOptions) { }

    generate(filesPattern: string): Promise<void> {

        const generateService = new GeneratorService(
            [new Lab2ConvertContextFactory],
            new Renderer({}),
            [],
            this.options
        );

        return generateService.generate(filesPattern);
    }

}
