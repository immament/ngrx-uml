import { ActionReferenceConvertContextFactory } from '../action-references';
import { ActionConvertContextFactory } from '../actions/converters';
import {
    ActionsPlantDiagramRenderFactory
} from '../actions/renderer/actions-plant-diagram-renderer.factory';

import { GeneratorOptions, GeneratorService } from './';
import { PlantUmlOutputService } from './plant-uml.service';

export class CreateActionsDiagramService {

    constructor(private options: GeneratorOptions) {
    }

    generateDiagram(filesPattern: string): void {


        const plantUmlService = new PlantUmlOutputService({
            outDir: this.options.outDir || 'out',
            ext: this.options.imageFormat || 'png',
            clickableLinks: this.options.clickableLinks || true,
            saveWsd:  this.options.saveWsd || false
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

        generateService.generate(filesPattern);
    }



}