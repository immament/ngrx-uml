import ts from 'typescript';

import { ConvertedItem } from '../models/convertet-item.model';
import { ContextFactory, ConvertContext } from './convert.context';
import { DefaultConverter } from './node-converters/default.converter';
import NodeConverter from './node-converters/node.converter';

export class Converter {
    private converters: { [kind: number]: NodeConverter } = {};

    private defaultConverter = new DefaultConverter();

    nodeFilter?: (node: ts.Node) => boolean;

    registerConverters(converters: { [kind: number]: NodeConverter }): void {
        this.converters = { ...this.converters,  ...converters};
    }

    // convert(contextFactory: ContextFactory, files: string[], baseDir: string, tsConfigFileName: string): unknown {
    //     const program = createProgram(files, baseDir, tsConfigFileName);
    //     return this.convertWithProgram(contextFactory, program);
    // }

    convert(contextFactory: ContextFactory, program: ts.Program, typeChecker: ts.TypeChecker): unknown {

        const context = contextFactory.create(program, typeChecker, this);
        contextFactory.configureConverter(this);

        for (const sourceFile of program.getSourceFiles()) {
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