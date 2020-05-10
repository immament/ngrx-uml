import { CreateActionsDiagramService, GeneratorOptions } from 'ngrx-uml';

/* eslint-disable no-console */
export function useCreateActionsDiagramService(): Promise<void>  {
    console.log('## Use CreateActionsDiagramService ####################################################################');
    const options: GeneratorOptions = {
        outDir: 'out/diagram-service',
        imageFormat: 'svg',
        ignorePattern: ['**/*.spec.ts'],
        tsConfigFileName: 'ss.ts',
        saveConvertResultToJson: false,
        saveWsd: true,
        logLevel: 'INFO'
    };
    const files = '../../test/test_data/**/*.ts';
    const createActionsDiagramService = new CreateActionsDiagramService(options);
    return createActionsDiagramService.generateDiagram(files)
        .then(() => console.log('Success use CreateActionsDiagramService'))
        .catch((err) => {
            console.error('Error in CreateActionsDiagramService', err);
        });
}