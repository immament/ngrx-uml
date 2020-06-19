import chalk from 'chalk';
import log from 'loglevel';
import { Node, Program } from 'typescript';

import { DefaultConverter } from '../../impl/converters/node-converters/default.converter';
import { LabItemConvertContext } from '../../sandbox/lab/converters/lab-item-convert.context';
import labUtils from '../../sandbox/lab/lab-utils';
import { syntaxKindText } from '../../utils';
import devLogger, { logColor } from '../../utils/logger';
import { printNode } from '../../utils/preparet-to-print';

import { ConvertContext } from './convert.context';
import { ConvertedItem, NamedConvertedItem, TypeKind } from './models';
import { NodeConverter } from './node.converter';

export class Converter {
    private converters: { [kind: number]: NodeConverter[] } = {};

    defaultConverter = new DefaultConverter();

    nodeFilter?: (node: Node) => boolean;

    registerConverters(
        converters: { [kind: number]: NodeConverter[] },
        { replace = false }: { replace?: boolean }
    ): void {
        this.converters = replace ? converters : { ...this.converters, ...converters };
    }


    convert(context: ConvertContext, program: Program): Map<TypeKind, NamedConvertedItem[]> | undefined {

        for (const sourceFile of program.getSourceFiles()
            .filter(sf => !program.isSourceFileFromExternalLibrary(sf) || !sf.isDeclarationFile)
        ) {

            log.trace('convert file:', chalk.cyan(sourceFile.fileName));

            this.convertRecursive(context, sourceFile);
        }
        context.finish();
        return context.getResult();

    }

    convertNode(context: ConvertContext, node: Node, withDefault = false): ConvertedItem | undefined {

        const nodeConverters: NodeConverter[] = this.converters[node.kind];

        if (nodeConverters) {
            for (const nodeConverter of nodeConverters) {
                const convertResult = nodeConverter.convert(context, node);
                if (convertResult) {
                    return convertResult;
                }
            }
        } else if (withDefault) {
            return this.defaultConverter.convert(context, node);
        }
        return;
    }

    convertRecursive(context: ConvertContext, node: Node): ConvertedItem | undefined {
        if (!this.nodeFilter || this.nodeFilter(node)) {

            const result = this.convertNode(context, node);
            if (result) {
                return result;
            }
        }

        node.forEachChild(child => {
            const childResult = this.convertRecursive(context, child);
            if (childResult) {
                devLogger.info(logColor.warn('child result: '), childResult.kindText);
            }
        });
        return;
    }

    convertRecursive2(context: LabItemConvertContext, node: Node, level = 0): ConvertedItem | undefined {
        devLogger.info(syntaxKindText(node), 'level:', level);
        if (!this.nodeFilter || this.nodeFilter(node)) {

            const result = this.convertNode(context, node);
            if (result) {
                return result;
            }
        }

        const getChildsResult = labUtils.getChilds(context.typeChecker, node);

        if (Array.isArray(getChildsResult)) {

            if(getChildsResult.length > 1) {
                devLogger.warn('  Childs count > 1:', getChildsResult.map(c => syntaxKindText(c)));
            }
            const childConvertResults = [];
            for (const child of getChildsResult) {
                const converResult = this.convertRecursive2(context, child, level + 1);
                if (converResult) {
                    childConvertResults.push(converResult);
                    devLogger.info('  child result:', syntaxKindText(child), labUtils.nodeText(child), converResult.kindText, 'level:', level);
                }
            }
            if (childConvertResults.length > 0) {
                // TODO: can be more??
                return childConvertResults[0];
            }
        } else {
            const symbol = getChildsResult;
            const fqn = context.typeChecker.getFullyQualifiedName(symbol);
            const item = context.symbolResolverService.getItem(fqn);
            if (item) {
                return item.item;
            }

            devLogger.warn('- Not resolved symbol:', printNode(symbol));

        }
        return;
    }

} 