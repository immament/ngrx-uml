import chalk from 'chalk';
import log from 'loglevel';
import { Node, Program } from 'typescript';

import { DefaultConverter } from '../../impl/converters/node-converters/default.converter';

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
            for (const converter of nodeConverters) {
                const convertResult = converter.convert(context, node);
                if (convertResult) {
                    return convertResult;
                }
            }
        } else if (withDefault) {
            return this.defaultConverter.convert(context, node);
        }
        return;
    }

    convertRecursive(context: ConvertContext, node: Node): void {
        if (!this.nodeFilter || this.nodeFilter(node)) {
            if (this.convertNode(context, node)) {
                return;
            }
        }

        node.forEachChild(child => {
            this.convertRecursive(context, child);
        });
    }

} 