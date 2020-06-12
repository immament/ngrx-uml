import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import http from 'http';
import log from 'loglevel';
import path from 'path';
import { encode } from 'plantuml-encoder';
import { Writable } from 'stream';

import { Output } from '../../core/outputs/output';
import { RenderResult } from '../../core/renderers';
import { removeiIlegalCharacters, writeToFile } from '../../utils';

export interface PlantUmlOutputOptions {
    outDir: string;
    ext: string;
    clickableLinks: boolean;
    saveWsd: boolean;
    generateDiagramsImages: boolean;
    plantUmlServerUrl?: string;
    remotePathPrefix?: string;

}

const defaultOptions = {
    plantUmlServerUrl: 'www.plantuml.com',
    remotePathPrefix: '/plantuml/'
};

export class PlantUmlOutputService implements Output {
    private readonly options: PlantUmlOutputOptions;

    constructor(options: PlantUmlOutputOptions) {
        this.options = { ...defaultOptions, ...options };
    }

    async transform(inputs: RenderResult[]): Promise<void> {
        for (const input of inputs) {
            await this.transformFromString(input.name, input.result);
        }
    }

    async transformFromString(name: string, input: string): Promise<void> {
        const diagram = this.createDiagram(name, input);
        const fileBaseName = removeiIlegalCharacters(name, this.options.clickableLinks);
        this.writeWsdToFile(diagram, this.options.outDir, fileBaseName);
        if (this.options.ext !== 'off') {
            return this.renderToImageFile(diagram, this.options.outDir, fileBaseName, this.options.ext);
        }
    }

    // #region IMAGE

    private renderToImageFile(input: string, outDir: string, fileName: string, ext: string): Promise<void> {
        if (!existsSync(outDir)) {
            mkdirSync(outDir, { recursive: true });
        }
        const writeStream = this.createWriteStream(outDir, fileName, ext);

        return this.renderImage(ext, input, writeStream);
    }

    private renderImage(extension: string, plantuml: string, resultStream: Writable): Promise<void> {

        const encodedPlantuml = encode(plantuml);

        const remotePath = `${this.options.remotePathPrefix}${extension}/${encodedPlantuml}`;

        return new Promise((resolve, reject) => {
            http.get({
                host: this.options.plantUmlServerUrl,
                path: remotePath
            }, (res: http.IncomingMessage): void => {

                res.pipe(resultStream);
                resultStream.on('close', () => {
                    resolve();
                });

                res.on('error', (err: Error): void => {
                    log.warn('mapToPlantUml', `problem with request ${err.message}`);
                    reject(err);
                });

            });
        });
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

    // #endregion

    // #region WSD

    private createDiagram(name: string, diagramContent: string): string {
        return `@startuml ${name}

set namespaceSeparator ::
skinparam class {
    BackgroundColor<<listen>> HoneyDew
    BackgroundColor<<action>> Wheat
    BackgroundColor<<dispatch>> Technology
}

${diagramContent} 

@enduml`;
    }

    private writeWsdToFile(diagram: string, outDir: string, name: string): void {
        if (this.options.saveWsd) {
            const fileName = name + '.wsd';
            const filePath = writeToFile(diagram, path.join(outDir, 'wsd'), fileName);
            log.info(`Wsd saved to: ${chalk.gray(filePath)}`);
        }
    }

    // #endregion

}