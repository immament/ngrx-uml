
import chalk from 'chalk';
import { once } from 'events';
import log, { LogLevelDesc, LogLevelNumbers } from 'loglevel';
import { EOL } from 'os';
import readline from 'readline';

const devLogger = log.getLogger('dev');

const logMethods: { [x: string]: number } = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
};

export const logColor: { [method: string]: chalk.Chalk } = {
    trace: chalk.gray,
    debug: chalk.white,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red
};

export default devLogger;


function getElement<T>(elements: T[], index: number): T | undefined {
    return elements.length > index ? elements[index] : undefined;
}

//TODO: configure baseDir
const baseDir = '/home/tofik-tuptus/Documents/android/ngrx-uml/';

function getStackLevel(level: number): string {
    const errStack = new Error().stack?.split('    at ');
    return errStack && getElement(errStack, level)?.replace(EOL, '').replace(baseDir, '') || '';
}



function getFnNameFromStackLine(line: string): string {
    if (!line) {
        return '';
    }

    return line.split(' ', 1)[0];
}

export function configLogger(logName: string, level: LogLevelDesc, shouldLogFnName?: boolean): void {
    const logger = log.getLogger(logName);
    if (shouldLogFnName) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        logFnNameWithFile(logger,  log.levels.INFO);
    }
    logger.setLevel(level);
}

type LoggerNames = 'converter' | 'node-converter' | 'symbol-resolve' | 'lab-utils' | 'known-element';

export function configLoggers(logNames: LoggerNames[], level: LogLevelDesc, shouldLogFnName?: boolean): void {

    for (const logName of logNames) {
        configLogger(logName, level, shouldLogFnName);
    }
}


export function logFnNameWithFile(logger: log.Logger, fileNameForMinLevel: LogLevelNumbers): void {

    const originalFactory = logger.methodFactory;

    logger.methodFactory = (methodName: string, level: log.LogLevelNumbers, loggerName: string): log.LoggingMethod => {
        const rawMethod = originalFactory(methodName, level, loggerName);
        const color = logColor[methodName];
        if (logMethods[methodName] >= fileNameForMinLevel) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (message: any, ...rest: any[]): void => {
                rawMethod(' ', chalk.gray(getStackLevel(3)), color(`${EOL}     ${methodName.toUpperCase()} ${message}`), ...rest);
            };
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (message: any, ...rest: any[]): void => {
                const logLineDetails = getFnNameFromStackLine(getStackLevel(3));
                rawMethod(color(methodName.toUpperCase()), chalk.gray(logLineDetails), color(message), ...rest);
            };
        }
    };
    logger.setLevel(devLogger.getLevel());
}


export function callStack(): string {
    return chalk.gray(new Error().stack?.substr(7) || '');
}

export function currentStackLevel(): string {
    return chalk.gray(getStackLevel(3));
}

export async function yesNoPrompt(msg = 'Do you want continue? (Yes/No) '): Promise<boolean> {

    let isAnswerYes = false;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, (answer: string) => {
        isAnswerYes = !!answer.match(/^y(es)?$/i);
        rl.close();
    });

    await once(rl, 'close');
    return isAnswerYes;
}