import { ActionConvertContextFactory, ActionReferenceConvertContextFactory } from '../..';
import {
    ActionsPlantDiagramRenderFactory
} from '../actions/renderer/actions-plant-diagram-renderer.factory';

import { GeneratorOptions, GeneratorService } from './';
import { DiagramService } from './diagram.service';
import { PlantUmlOutputService } from './plant-uml.service';

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
            plantUmlService,
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