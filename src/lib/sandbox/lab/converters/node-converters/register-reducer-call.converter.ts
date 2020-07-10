
import ts from 'typescript';

import { NamedConvertedItem, TypeKind } from '../../../../core/converters/models';
import { NodeConverter } from '../../../../core/converters/node.converter';
import { callStack } from '../../../../utils/logger';
import { printNode } from '../../../../utils/preparet-to-print';
import { RegisteredReducerItem } from '../../../converters/models/registered-reducer.item';
import { SymbolResolveItem } from '../../../converters/models/symbol-resolve.item';
import labUtils from '../../lab-utils';
import { LabItemConvertContext } from '../lab-item-convert.context';

export class RegisterReducerCallConverter extends NodeConverter {


    /**
     * Convert StoreModule.forFeature CallExpression
     */
    convert(context: LabItemConvertContext, storeModuleCall: ts.CallExpression): NamedConvertedItem | undefined {
        const [nameArg, reducerArg] = storeModuleCall.arguments;
        const name = labUtils.getValue<string>(context.typeChecker, nameArg) || 'noForFeatureKey';

        const registeredReducer = this.createRegisteredReducer(name, storeModuleCall);

        this.resolveReducersArg(context, reducerArg, registeredReducer);
        return registeredReducer;
    }

    private resolveReducersArg(
        context: LabItemConvertContext,
        reducerArg: ts.Expression,
        registeredReducer: RegisteredReducerItem
    ): void {
        const resolved = context.converter.getResolvedItem(context, reducerArg);

        if (!resolved) {
            NodeConverter.devLogger.warn('- Reducer not found', callStack());
            return;
        }

        NodeConverter.devLogger.warn('resolved:', registeredReducer.name);

        for (const resolvedItem of resolved) {
            
            switch (resolvedItem.kind) {
                case TypeKind.SymbolResolveItem: {
                    const symbolResolveItem = resolvedItem as SymbolResolveItem;
                    symbolResolveItem.addReference({
                        item: registeredReducer,
                        propertyName: 'registered'
                    });

                    break;
                }
                case TypeKind.Reducer:
                    registeredReducer.registered = resolvedItem;
                    break;

                case TypeKind.CombineReducers:
                    registeredReducer.registered = resolvedItem;
                    break;
                case TypeKind.Unknown:
                    registeredReducer.registered = resolvedItem;
                    break;

                default:
                    NodeConverter.devLogger.warn('- Unknown kind:', printNode(resolvedItem));
                    break;
            }
        }
    }

    private createRegisteredReducer(
        name: string | undefined,
        srcNode: ts.Node,
    ): RegisteredReducerItem {
        const registeredReducer = new RegisteredReducerItem(
            name || 'noName',
            srcNode.getSourceFile().fileName,
            srcNode.getStart(),
            srcNode.getEnd()
        );

        NodeConverter.devLogger.info('registeredReducer', registeredReducer.name);
        return registeredReducer;
    }
}
