/* eslint-disable no-console */
import {
    ActionConvertContextFactory, ActionReferenceConvertContextFactory,
    ActionsPlantDiagramRenderFactory, GeneratorOptions, GeneratorService, PlantUmlOutputService
} from 'ngrx-uml';

export function useGeneratorService(): Promise<void> {

    console.log('## Use GenerateService ####################################################################');
    const options: GeneratorOptions = {
        outDir: 'out/generator',
        imageFormat: 'png',
        ignorePattern: ['**/*.spec.ts'],
        saveConvertResultToJson: false,
        // tsConfigFileName: 'tsconfig.json',
        clickableLinks: true,
        saveWsd: false,
        logLevel: 'INFO'
    };

    const plantUmlService = new PlantUmlOutputService({
        outDir: options.outDir || 'out',
        ext: options.imageFormat || 'png',
        clickableLinks: options.clickableLinks != null ? options.clickableLinks : false,
        saveWsd: options.saveWsd != null ? options.saveWsd : false,
        generateDiagramsImages: options.generateImages != null ? options.generateImages : true
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
    return generateService.generate(files)
        .then(() => console.log('Success use GenerateService'))
        .catch((err) => {
            console.error('Error in GenerateService', err);
        });

}