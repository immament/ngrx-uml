

import { PlantUmlOutputService } from '../services/plant-uml.service';

function testPlantServer(outDir = 'out'): void {

    const plantUmlService = new PlantUmlOutputService({ outDir, ext: 'txt', clickableLinks: true, saveWsd: true,  generateDiagramsImages: true });

    const diagram = `

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

    `;

    plantUmlService.transformFromString('test-plant', diagram);


}


export default testPlantServer;

// class Car

// Driver - Car : drives >
// Car *- Wheel : have 4 >
// Car -- Person : < owns