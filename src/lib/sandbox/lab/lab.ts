

import { GeneratorOptions } from '../../services';
import devLogger, { logFnName } from '../../utils/logger';

import { LabService } from './services/lab.service';

logFnName(devLogger);
devLogger.setLevel('DEBUG');

const options: GeneratorOptions = {
    baseDir: '../_sandbox_/ngrx-example-app',
    // baseDir: '../_sandbox_/ngrx-example-app-without-node-modules/src',
    // baseDir: __dirname + '/sample_data',
    imageFormat: 'off',
    generateImages: false,
    ignorePattern: ['**/*.spec.ts'],
    tsConfigFileName: 'tsconfig.json',
    saveConvertResultToJson: true,
    saveWsd: false,
    logLevel: 'INFO'
};


// -f '**/*ts' -d  -i '**/*.spec.ts' -c tsconfig.app.json --js
const labService = new LabService(options);


labService.generate('src/**/*.ts');

