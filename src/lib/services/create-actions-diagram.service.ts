import { ActionConvertContextFactory, ActionReferenceConvertContextFactory } from '../..';
import { PlantUmlOutputService } from '../impl/outputs/plant-uml-output.service';
import {
    ActionsPlantDiagramRenderFactory
} from '../impl/renderers/actions-plant-diagram-renderer.factory';

import { GeneratorOptions, GeneratorService } from './';
import { DiagramService } from './diagram.service';

export class CreateActionsDiagramService implements DiagramService {

    constructor(private options: GeneratorOptions) {
    }

    generateDiagram(filesPattern: string): Promise<void> {

        const plantUmlService = new PlantUmlOutputService({
            outDir: this.options.outDir || 'out',
            ext: this.options.imageFormat || 'png',
            clickableLinks: this.options.clickableLinks  || false,
            saveWsd:  this.options.saveWsd || false,
            generateDiagramsImages: this.options.generateImages || true
        });

        const generateService = new GeneratorService(
            [
                new ActionConvertContextFactory,
                new ActionReferenceConvertContextFactory,
            ],
            new ActionsPlantDiagramRenderFactory().create(),
            [plantUmlService],
            this.options
        );

        return generateService.generate(filesPattern);
    }



}