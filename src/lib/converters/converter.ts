import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { DefaultConverter } from '../actions/converters/node-converters/default.converter';

import { ConvertContext } from './convert.context';
import { ConvertedItem, NamedConvertedItem, TypeKind } from './models';
import { NodeConverter } from './models/node.converter';

export class Converter {
    private converters: { [kind: number]: NodeConverter[] } = {};

    defaultConverter = new DefaultConverter();

    nodeFilter?: (node: ts.Node) => boolean;

    registerConverters(
        converters: { [kind: number]: NodeConverter[] },
        { replace = false }: { replace?: boolean }
    ): void {
        this.converters = replace ? converters : { ...this.converters, ...converters };
    }


    convert(context: ConvertContext, program: ts.Program): Map<TypeKind, NamedConvertedItem[]> | undefined {

        for (const sourceFile of program.getSourceFiles()) {
            if (sourceFile.isDeclarationFile) {
                continue;
            }
            log.trace('convert file:', chalk.cyan(sourceFile.fileName));

            sourceFile.forEachChild((node) => this.convertRecursive(context, node));
        }
        return context.getResult();

    }

    convertNode(context: ConvertContext, node: ts.Node, withDefault = false): ConvertedItem | undefined {

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
    }

    convertRecursive(context: ConvertContext, node: ts.Node): void {
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