import { GeneratorService, PlantUmlService } from 'ngrx-uml';

const createDiagramService = new GeneratorService(
    new PlantUmlService(),
    {
        outDir: 'out',
        imageFormat: 'svg',
        ignorePattern: ['**/*.spec.ts'],
        saveActionsReferencesToJson: true,
        saveActionsToJson: true,
        saveWsd: true,
        logLevel: 'INFO'
    });

const files = '../../test/test_data/**/*.ts';

createDiagramService.generate(files);
