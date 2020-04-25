import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { DefaultConverter } from '../actions/converters/node-converters/default.converter';

import { ContextFactory, ConvertContext } from './convert.context';
import NodeConverter from './models/node.converter';
import { ConvertedItem } from './models/type.model';

export class Converter {
    private converters: { [kind: number]: NodeConverter } = {};

    private defaultConverter = new DefaultConverter();

    nodeFilter?: (node: ts.Node) => boolean;

    registerConverters(converters: { [kind: number]: NodeConverter }, { replace = false }: { replace?: boolean } ): void {
        this.converters = replace ? converters : { ...this.converters, ...converters };
    }

    convert(contextFactory: ContextFactory, program: ts.Program, typeChecker: ts.TypeChecker): unknown {

        const context = contextFactory.create(program, typeChecker, this);
        contextFactory.configureConverter(this);

        for (const sourceFile of program.getSourceFiles()) {
            if(sourceFile.isDeclarationFile) {
                continue;
            }
            log.trace('convert', chalk.cyan(sourceFile.fileName));

            sourceFile.forEachChild((node) => this.convertRecursive(context, node));
        }
        return context.result;

    }

    convertNode(context: ConvertContext, node: ts.Node, withDefault = false): ConvertedItem | undefined {
        if (this.converters[node.kind]) {
            return this.converters[node.kind].convert(context, node);
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