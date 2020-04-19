import chalk from 'chalk';
import { createWriteStream, WriteStream } from 'fs';
import http from 'http';
import log from 'loglevel';
import path from 'path';
import { encode } from 'plantuml-encoder';

import { writeToFile } from '../utils/utils';
import { Action } from './models/action.model';

function removeiIlegalCharacters(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, ' ');
}

function writeDiagramToFile(name: string, diagram: string, outDir: string): void {

    name = removeiIlegalCharacters(name);
    writeToFile(diagram, outDir, name + '.wsd');
}


export function requestImageFile(outDir: string, fileName: string, extension: string, plantuml: string): void {

    fileName = removeiIlegalCharacters(fileName);
    const encodedPlantuml = encode(plantuml);

    // writeToFile(decode(encodedPlanuml), outDir, fileName + '.decoded.wsd');

    const remotePath = `/plantuml/${extension}/${encodedPlantuml}`
    log.trace(chalk.yellow(fileName + '`:'), remotePath);

    const filePath = path.format({
        dir: outDir, name: fileName, ext: '.' + extension
    });
    http.get({
        host: 'www.plantuml.com',
        path: remotePath
    }, (res: http.IncomingMessage): void => {

        const fileStream: WriteStream = createWriteStream(filePath);
        fileStream.once('close', () => {
           log.debug('saved diagram image: ', chalk.cyan(filePath));
        });

        res.pipe(fileStream);

        res.on('error', (err: Error): void => {
            log.warn('mapToPlantUml', `problem with request [${fileName}] ${err.message}`);
            throw err;
        });

    });
}


function createDiagram(name: string, diagramContent: string): string {
    return `@startuml ${name}

    set namespaceSeparator ::

    ${diagramContent} 

    @enduml`;
}

export function writeDiagramsToFiles(actions: Action[], outDir: string): void {
    for (const action of actions) {
        const diagramContent = action.toPlantUml(true);
        const diagram = createDiagram(action.name, diagramContent);
        writeDiagramToFile(action.name, diagram, outDir);
        const ext = 'png';

        requestImageFile(outDir, action.name, ext, diagram);

    }
}

