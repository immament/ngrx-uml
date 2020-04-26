import log from 'loglevel';

export interface GeneratorOptions {
    ignorePattern?: string | string[];
    saveActionsToJson?: boolean;
    saveActionsReferencesToJson?: boolean;
    saveWsd?: boolean;
    outDir?: string;
    baseDir?: string;
    tsConfigFileName?: string;
    clickableLinks?: boolean;
    imageFormat?: string;
    generateImages?: boolean;
    logLevel?: log.LogLevelDesc;
}
