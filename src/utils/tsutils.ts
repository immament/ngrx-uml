import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

export function syntaxKindText(element: { kind: ts.SyntaxKind }): string {
    return ts.SyntaxKind[element.kind];
}

export function getCallExpressionName(callExpression: ts.CallExpression): string | null {
    return ts.isIdentifier(callExpression.expression) ? callExpression.expression.text : null;
}



function readConfigFile(baseDir: string, configName: string): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: any;
    error?: ts.Diagnostic | undefined;
} {
    const configFileName = ts.findConfigFile(baseDir, ts.sys.fileExists, configName);

    if (!configFileName) {
        console.error(`Can't file config file`);
        throw new Error(`Can't file config file`);
    }

    return ts.readConfigFile(configFileName, ts.sys.readFile);

}

export function createProgram(fileNames: string[], baseDir: string, configName: string): ts.Program {

    log.debug(chalk.yellowBright('baseDir:'), baseDir, chalk.yellowBright('configName:'),configName);
    const configFileRef = readConfigFile(baseDir, configName);

    if (configFileRef.error) {
        log.warn(configFileRef.error.messageText);
    }

    log.trace('configFile', configFileRef.config);

    const parseConfigHost: ts.ParseConfigHost = {
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        useCaseSensitiveFileNames: true
    };

    const compilerOptions = ts.parseJsonConfigFileContent(configFileRef.config, parseConfigHost, "./");

    log.trace(chalk.yellow('CompilerOptions:'), compilerOptions.options);
    compilerOptions.options.baseUrl = baseDir;
    const program = ts.createProgram([...fileNames], compilerOptions.options);
    return program;
}