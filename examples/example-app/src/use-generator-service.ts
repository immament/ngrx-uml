/* eslint-disable no-console */
import {
    ActionConvertContextFactory, ActionReferenceConvertContextFactory,
    ActionsPlantDiagramRenderFactory, GeneratorOptions, GeneratorService, PlantUmlOutputService
} from 'ngrx-uml';

export function useGeneratorService(): void {

    console.log('#############################################################################');
    console.log('## Use GenerateService');
    const options: GeneratorOptions = {
        outDir: 'out/generator',
        imageFormat: 'png',
        ignorePattern: ['**/*.spec.ts'],
        saveConvertResultToJson: false,
        saveWsd: false,
        logLevel: 'INFO'
    };

    const plantUmlService = new PlantUmlOutputService({
        outDir: options.outDir || 'out',
        ext: options.imageFormat || 'png',
        clickableLinks: options.clickableLinks || false,
        saveWsd: options.saveWsd || false
    });


    const generateService = new GeneratorService(
        plantUmlService,
        [
            new ActionConvertContextFactory,
            new ActionReferenceConvertContextFactory,
        ],
        new ActionsPlantDiagramRenderFactory().create(),
        [plantUmlService],
        options
    );

    const files = '../../test/test_data/**/*.ts';
    generateService.generate(files);

}