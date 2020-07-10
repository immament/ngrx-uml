import log from 'loglevel';
import ts, { Node, Program } from 'typescript';

import { DefaultConverter } from '../../impl/converters/node-converters/default.converter';
import { LabItemConvertContext } from '../../sandbox/lab/converters/lab-item-convert.context';
import labUtils from '../../sandbox/lab/lab-utils';
import tsutils, { syntaxKindLog } from '../../utils/tsutils';

import { ConvertContext } from './convert.context';
import { ConvertedItem, NamedConvertedItem, TypeKind } from './models';
import { NodeConverter } from './node.converter';

const logger = log.getLogger('converter');

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

            logger.trace('convert file:', sourceFile.fileName);

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
        if (this.filter(node)) {

            const result = this.convertNode(context, node);
            if (result) {
                return result;
            }
        }
        return this.convertChild(context, node);

    }

    convertChild(context: ConvertContext, node: Node): ConvertedItem | undefined {
        node.forEachChild(child => {
            const childResult = this.convertRecursive(context, child);
            if (childResult) {
                logger.debug('  convertRecursive child result:', `[${childResult.kindText}]`);
            }
        });
        return;
    }

    private filter(node: Node): boolean {
        return !this.nodeFilter || this.nodeFilter(node);
    }


    getResolvedItem(context: LabItemConvertContext, node: Node, level = 0): ConvertedItem[] | undefined {
        logger.debug(`+ ${syntaxKindLog(node)} - level: ${level} - ${labUtils.nodeText(node, { maxLength: 30 })}`);
        if (level >= 0 && (!this.nodeFilter || !this.nodeFilter(node))) {
            const result = this.convertNode(context, node);
            logger.debug(`  ${syntaxKindLog(node)} - level: ${level} - has convert result: ${!!result}`);
            if (result) {
                logger.info(`- result:`, result.kindText);
                return [result];
            }
        }

        const childs = labUtils.getReturnedChild(context.typeChecker, node);

        if (!childs) { return; }
        const convertedItems: ConvertedItem[] = [];

        logger.info(`  ${syntaxKindLog(node)} - level: ${level} - childs: ${childs.length}`);

        for (const item of childs) {
            const resolveResult = this.resolve(context, item, level);
            if (resolveResult) {
                convertedItems.push(...resolveResult);
            }
        }
        logger.info(`- result: ${labUtils.nodeText(node)} - level: ${level} - convertedItems count: ${convertedItems.length}`);

        return convertedItems;

    }

    private resolve(context: LabItemConvertContext, child: ts.Node | ts.Symbol, level: number): ConvertedItem[] | undefined {

        if (tsutils.isNode(child)) {
            const resolvedItem = this.getResolvedItem(context, child, level + 1);
            if (resolvedItem) {
                logger.info(`- resolved item - level: ${level}`);
                return resolvedItem;
            }
            return;

        } else {

            logger.info(`  resolve symbol:`, child.escapedName);
            const symbolResolveItem = context.symbolResolverService.resolveItem(child);
            if (symbolResolveItem) {
                if (symbolResolveItem.isResolved) {
                    logger.info(`- resolvedItems count: ${symbolResolveItem.resolvedItems.length} - symbol: ${child.escapedName}`);
                    return symbolResolveItem.resolvedItems;
                }

                return [symbolResolveItem];
            }
        }
        return;
    }

} 