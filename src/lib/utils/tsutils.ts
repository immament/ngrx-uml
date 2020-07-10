import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

export function syntaxKindText(element: { kind: ts.SyntaxKind }): string {
    return ts.SyntaxKind[element.kind];
}

export function syntaxKindLog(element: { kind: ts.SyntaxKind }): string {
    return chalk.green(`[ ${ts.SyntaxKind[element.kind]} ]`);
}


export function getCallExpressionName(callExpression: ts.CallExpression): string | undefined {
    return ts.isIdentifier(callExpression.expression) ? callExpression.expression.text : undefined;
}

function readConfigFile(baseDir: string, configName: string): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: any;
    error?: ts.Diagnostic | undefined;
} {
    const configFileName = ts.findConfigFile(baseDir, ts.sys.fileExists, configName);

    if (!configFileName) {
        const errMsg = `Can't find ts-config file: '${configName}', baseDir: '${baseDir}'`;
        log.error('Error', chalk.red(errMsg));
        throw new Error(errMsg);
    }
    log.info(chalk.yellow(`Use ts-config file: ${configFileName}`));

    return ts.readConfigFile(configFileName, ts.sys.readFile);

}

export function createTsProgram(fileNames: string[], baseDir: string, configName: string): ts.Program {

    log.debug(chalk.yellowBright('baseDir:'), baseDir, chalk.yellowBright('configName:'), configName);
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

    const compilerOptions = ts.parseJsonConfigFileContent(configFileRef.config, parseConfigHost, baseDir);

    log.trace(chalk.yellow('CompilerOptions:'), compilerOptions.options);
    compilerOptions.options.baseUrl = baseDir;
    const program = ts.createProgram(fileNames, compilerOptions.options);

    return program;
}

export function isSymbol(object: unknown): object is ts.Symbol {
    const symbol = (object as ts.Symbol); 
    return symbol && symbol.valueDeclaration != null || (symbol.flags & ts.SymbolFlags.AliasExcludes )> 0;
}

export function isNode(object: unknown): object is ts.Node {
    return (object as ts.Node)?.kind > 0;
}


function symbolFlagsToString(flags: ts.SymbolFlags): string {
    let i = 0;
    let flag: number;
    let resultText = '';
    while (ts.SymbolFlags[flag = 1 << i++]) {
        if (flags & flag) {
            resultText += ts.SymbolFlags[flag];
        }
    }
    return resultText;
}


const tsutils = {
    syntaxKindText,
    getCallExpressionName,
    createTsProgram,
    isSymbol,
    isNode,
    symbolFlagsToString
};

export default tsutils;

