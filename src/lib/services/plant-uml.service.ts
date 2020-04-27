import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import http from 'http';
import log from 'loglevel';
import path from 'path';
import { encode } from 'plantuml-encoder';
import { Writable } from 'stream';

import { Output } from '../outputs/output';
import { RenderResult } from '../renderers';
import { removeiIlegalCharacters, writeToFile } from '../utils';

export interface PlantUmlOutputOptions {
    outDir: string;
    ext: string;
    clickableLinks: boolean;
    saveWsd: boolean;
}

export class PlantUmlOutputService implements Output {

    plantUmlServerUrl = 'www.plantuml.com';
    remotePathPrefix = '/plantuml/';

    constructor(private options: PlantUmlOutputOptions) {

    }

    transform(inputs: RenderResult[]): void {
        for (const input of inputs) {
            this.transformFromString(input.name, input.result);
        }
    }

    transformFromString(name: string, input: string): void {
        const diagram = this.createDiagram(name, input);
        const fileBaseName = removeiIlegalCharacters(name, this.options.clickableLinks);
        this.writeWsdToFile(diagram, this.options.outDir, fileBaseName);
        this.renderToImageFile(diagram, this.options.outDir, fileBaseName, this.options.ext);
    }

    renderImage(extension: string, plantuml: string, resultStream: Writable): void {

        const encodedPlantuml = encode(plantuml);

        const remotePath = `${this.remotePathPrefix}${extension}/${encodedPlantuml}`;

        http.get({
            host: this.plantUmlServerUrl,
            path: remotePath
        }, (res: http.IncomingMessage): void => {

            res.pipe(resultStream);

            res.on('error', (err: Error): void => {
                log.warn('mapToPlantUml', `problem with request ${err.message}`);
                throw err;
            });

        });
    }

    private createDiagram(name: string, diagramContent: string): string {
        return `@startuml ${name}

        set namespaceSeparator ::

        ${diagramContent} 

        @enduml`;
    }

    private renderToImageFile(input: string, outDir: string, fileName: string, ext: string): void {
        if (!existsSync(outDir)) {
            mkdirSync(outDir);
        }
        const writeStream = this.createWriteStream(outDir, fileName, ext);
        this.renderImage(ext, input, writeStream);
    }


    private createWriteStream(outDir: string, fileName: string, extension: string): WriteStream {
        const filePath = path.format({
            dir: outDir, name: fileName, ext: '.' + extension
        });
        const fileStream: WriteStream = createWriteStream(filePath);
        fileStream.once('close', () => {
            log.info(`Diagram image saved: ${chalk.cyan(filePath)} `);
        });
        return fileStream;
    }

    private writeWsdToFile(diagram: string, outDir: string, name: string): void {
        if (this.options.saveWsd) {
            const fileName = name + '.wsd';
            writeToFile(diagram, outDir, fileName);
            log.info(`Wsd saved to: ${chalk.gray(`${outDir}/${fileName}`)}`);
        }
    }

}