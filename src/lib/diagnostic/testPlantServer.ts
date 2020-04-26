

import { GeneratorService } from '../services/generator.service';
import { PlantUmlService } from '../services/plant-uml.service';

function testPlantServer(outDir = 'out'): void {

    const plantUmlService = new PlantUmlService();
    const generatorService = new GeneratorService(plantUmlService,  {outDir});


    const diagram = `
    @startuml
    
    interface "[Auth/API] Login Failure" << (A,#FF7700) action >> {
        variable: loginFailure
        src: auth-api.actions
        ..
        props<{
        \\terror: any,
        \\tbooks: Books[],
        }>
        createFunction: arrow
    }
    
    @enduml
    `;

    generatorService.renderToImageFile(outDir,  diagram, 'test', 'png' );

   
}


export default testPlantServer;

// class Car

// Driver - Car : drives >
// Car *- Wheel : have 4 >
// Car -- Person : < owns