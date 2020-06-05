import ts, { Node, SourceFile, SyntaxKind } from 'typescript';

import { syntaxKindText } from '../../src/lib/utils';

export function getNodeAtPosition(sourceFile: SourceFile, position: number): Node {
    const getContainingChild = (child: Node): Node | undefined => {
        if (child.pos <= position && (position < child.end || (position === child.end && (child.kind === SyntaxKind.EndOfFileToken)))) {
            return child;
        }
        return;
    };

    let current: Node = sourceFile;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const child = current.getChildren().find(getContainingChild);
        if (!child) {
            return current;
        }
        console.log(syntaxKindText(child), child.pos, position);
        if (child.pos === position) {
            return child;
        }
        current = child;
    }
}

export function createInMemoryCompilerHost(): ts.CompilerHost {

    const files: { [fileName: string]: string } = {
        'sandbox.ts': `@NgModule({
  imports: [
    StoreModule.forFeature(fromCoach.coachFeatureKey, fromCoach.reducers),
    EffectsModule.forFeature([CoachEffects])
  ],
  declarations: [
    CoachPage,
    TeamSelectionComponent
  ]
})
export class CoachPageModule { }
`
    };

    function fileExists(fileName: string): boolean {
        return Object.keys(files).includes(fileName);
    }

    function readFile(fileName: string): string | undefined {
        return files[fileName];
    }

    function getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, _onError?: (message: string) => void): ts.SourceFile | undefined {
        const sourceText = readFile(fileName);
        return sourceText !== undefined
            ? ts.createSourceFile(fileName, sourceText, languageVersion)
            : undefined;
    }


    return {
        fileExists,
        directoryExists: (dirPath): boolean => dirPath === '/',
        getCurrentDirectory: (): string => '/',
        getDirectories: (): string[] => [],
        getCanonicalFileName: (fileName): string => fileName,
        getNewLine: (): string => '\n',
        getDefaultLibFileName: (): string => '',
        getSourceFile,
        readFile,
        useCaseSensitiveFileNames: (): boolean => true,
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        writeFile: () => ({})
    };
}

/** Get the token whose text contains the position */
export function getTokenAtPosition(
    sourceFile: SourceFile,
    position: number,
    ifOnPositionFilter?: (node: ts.Node) => boolean
): Node | undefined {
    let current: Node = sourceFile;
    // eslint-disable-next-line no-constant-condition
    outer: while (true) {
        // find the child that contains 'position'
        for (const child of current.getChildren(sourceFile)) {
            const start = child.getStart(sourceFile, /*includeJsDoc*/ true);
            if (start > position) {
                return;
            }

            if (start === position && ifOnPositionFilter && ifOnPositionFilter(child)) {
                return child;
            }

            const end = child.getEnd();
            if (position < end || (position === end && (child.kind === SyntaxKind.EndOfFileToken))) {
                current = child;
                continue outer;
            }

        }

        return current;
    }
}

export function getTokens(text: string, sourceFile: ts.SourceFile, ifOnPositionFilter?: (node: ts.Node) => boolean): Node[] {
    const tokens = [];
    const sourceFileText = sourceFile.getFullText();

    let position = sourceFileText.indexOf(text);
    while (position >= 0) {
        const token = getTokenAtPosition(sourceFile, position, ifOnPositionFilter);
        if (token) {
            tokens.push(token);
        }
        position = sourceFileText.indexOf(text, position + 1);
    }
    return tokens;
}