import { LogLevelDesc } from 'loglevel';

export interface GeneratorOptions {
    ignorePattern?: string | string[];
    saveConvertResultToJson?: boolean;
    saveWsd?: boolean;
    outDir?: string;
    baseDir?: string;
    tsConfigFileName?: string;
    clickableLinks?: boolean;
    imageFormat?: string;
    generateImages?: boolean;
    logLevel?: LogLevelDesc;
}
