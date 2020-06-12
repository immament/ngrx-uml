
import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters/convert.context';
import {
    ConvertedItem
} from '../../../core/converters/models/converted-items/converted-item.model';
import { Member } from '../../../core/converters/models/member.model';
import { State } from '../../../core/converters/models/state.model';
import { NodeConverter } from '../../../core/converters/node.converter';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _ts from '../../../ts-internal';
import { getCallExpressionName, syntaxKindText } from '../../../utils/tsutils';
import { Reducer } from '../../models/reducer.model';

const createReducerName = 'createReducer';

export class CreateReducerCallExpConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.CallExpression): ConvertedItem | undefined {
        if (this.isCreateReducer(node)) {
            const reducer = new Reducer(
                node.getSourceFile().fileName,
                node.getStart(),
                node.getEnd()
            );
            log.debug(`Found reducer in ${chalk.gray(reducer.filePath)}`);

            const extractedArgs = this.extractArguments(context, node.arguments);
            reducer.state = extractedArgs.state;
            return reducer;
        }
        return;
    }

    private isCreateReducer(callExpression: ts.CallExpression): boolean {
        return getCallExpressionName(callExpression) === createReducerName;
    }

    private extractArguments(context: ConvertContext, args: ts.NodeArray<ts.Expression>): { state?: State; ons?: {}[] } {
        const [initialState] = args;
        const state = this.getState(context, initialState);

        // const convertedOns = ons.map(on => context.converter.convertNode(context, on)).filter(on => on);

        return { state };
    }


    convertType(_context: ConvertContext, typeNode: ts.TypeNode): string {
        const type = _context.typeChecker.getTypeFromTypeNode(typeNode);
        return _context.typeChecker.typeToString(type);
    }

    private convertMember(context: ConvertContext, node: ts.Declaration): Member | undefined {
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature: {
                const propertySignature = node as ts.PropertySignature;
                const name = node.symbol?.name;
                const type = propertySignature.type && this.convertType(context, propertySignature.type);
                return { name, type };
            }

            default:
                log.warn(`getMember - unknown node kind ${syntaxKindText(node)}`);
                break;
        }
        return undefined;
    }

    private getState(context: ConvertContext, node: ts.Node): State | undefined {
        switch (node.kind) {
            case ts.SyntaxKind.Identifier: {
                const identifer = node as ts.Identifier;
                const symbol = context.typeChecker.getSymbolAtLocation(identifer);
                if (symbol) {

                    const type = context.typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);

                    if (type) {
                        const properties = context.typeChecker.getPropertiesOfType(type);
                        const props = properties.map(p => this.convertMember(context, p.valueDeclaration)).filter(m => m) as Member[];
                        return { name: context.typeChecker.typeToString(type), properties: props };
                    }
                }
                else {
                    log.warn('getState - no Identifier symbol', identifer.getText());
                }

                break;
            }


            default:
                log.warn(`getState - unknown node kind ${syntaxKindText(node)}`);
                break;
        }
        return;
    }
}