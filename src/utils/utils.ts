import { existsSync, mkdirSync, writeFileSync } from 'fs';
import log from 'loglevel';
import path from 'path';

export function objectFlter<T>(key: string, value: T): T | undefined {
    if (!key) {
        return value;
    }

    if (typeof value === 'object')
        return undefined;
    return value;
}

export function getKeyReplacer(keyToReplace: string) {
    return function actionReplacer<T>(key: string, value: T): T | undefined {
        if (key === keyToReplace) {
            return undefined;
        }
        return value;
    }
    
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeJsonToFile(data: unknown, outDir: string, fileName: string, replacer?: (key: string, value: any) => any): void {

    if (!existsSync(outDir)) {
        mkdirSync(outDir);
    }

    const filePath = `${outDir}${fileName}`;

    log.trace('write file', filePath);
    const fileData = JSON.stringify(data, replacer, 2);
    writeFileSync(filePath, fileData);
}

export function writeToFile(content: string, outDir: string, fileName: string): void {

    if (!existsSync(outDir)) {
        mkdirSync(outDir);
    }

    const filePath = `${outDir}/${fileName}`;

    log.trace('write file', filePath);
    writeFileSync(filePath, content);
}

export function prepareTraceLogger(): void {
    if (log.getLevel() === log.levels.TRACE) {
        log.trace = log.debug;
    }
}

export function getFileName(filePath?: string): string | undefined {
    return filePath && path.parse(filePath).name;
}


export function printProgress(progress: string): void{
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(progress);
}

export function getCommandFilesExtensionsForEnvironment(): string[] {
    return __filename.endsWith('ts')  ? ['js', 'ts'] : ['js']
  }
  