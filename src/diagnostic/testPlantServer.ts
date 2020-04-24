import chalk from 'chalk';
import fs from 'fs';
import log from 'loglevel';
import path from 'path';

import { CreateActionsDiagramService } from '../services/create-diagram.service';
import { PlantUmlService } from '../services/plant-uml.service';

function createWriteStream(outDir: string, fileName: string, extension: string): fs.WriteStream {
    const filePath = path.format({
        dir: outDir, name: fileName, ext: '.' + extension
    });
    const fileStream: fs.WriteStream = fs.createWriteStream(filePath);
    fileStream.once('close', () => {
        log.info(`Diagram image saved: ${chalk.cyan(filePath)} `);
    });
    return fileStream;

}

function testPlantServer(outDir = 'out'): void {

    const plantUmlService = new PlantUmlService();
    const createDiagramService = new CreateActionsDiagramService(plantUmlService, {outDir});


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

    createDiagramService.renderToImageFile(outDir,  diagram, 'test', 'png' );

   
}


export default testPlantServer;

// class Car

// Driver - Car : drives >
// Car *- Wheel : have 4 >
// Car -- Person : < owns