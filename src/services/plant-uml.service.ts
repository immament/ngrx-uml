import { WriteStream } from 'fs';
import http from 'http';
import log from 'loglevel';
import { encode } from 'plantuml-encoder';

export class PlantUmlService {

    plantUmlServerUrl = 'www.plantuml.com';
    remotePathPrefix = '/plantuml/';

    renderImage(extension: string, plantuml: string, resultStream: WriteStream): void {
  
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
}