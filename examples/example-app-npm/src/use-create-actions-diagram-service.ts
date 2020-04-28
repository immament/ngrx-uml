import { CreateActionsDiagramService, GeneratorOptions } from 'ngrx-uml';

/* eslint-disable no-console */
export function useCreateActionsDiagramService(): void {
    console.log('#####################################################################');
    console.log('## Use CreateActionsDiagramService');
    const options: GeneratorOptions = {
        outDir: 'out/create-actions-diagram-service',
        imageFormat: 'svg',
        ignorePattern: ['**/*.spec.ts'],
        saveConvertResultToJson: true,
        saveWsd: true,
        logLevel: 'INFO'
    };
    const files = '../../test/test_data/**/*.ts';
    const createActionsDiagramService = new CreateActionsDiagramService(options);
    createActionsDiagramService.generateDiagram(files);
}