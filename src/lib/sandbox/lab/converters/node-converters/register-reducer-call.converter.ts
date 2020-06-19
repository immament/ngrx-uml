
import ts from 'typescript';

import { NamedConvertedItem } from '../../../../core/converters/models';
import { NodeConverter } from '../../../../core/converters/node.converter';
import devLogger, { logColor } from '../../../../utils/logger';
import { RegisteredReducerItem } from '../../../converters/models/registered-reducer.model';
import labUtils, { SearchedItem } from '../../lab-utils';
import { LabItemConvertContext } from '../lab-item-convert.context';

export class RegisterReducerCallConverter extends NodeConverter {

    convert(context: LabItemConvertContext, storeModuleCall: ts.CallExpression): NamedConvertedItem | undefined {
        const [nameArg, reducerArg ] = storeModuleCall.arguments;
        const name = labUtils.getValue<string>(context.typeChecker, nameArg) || 'noForFeatureKey';

        const reducerSearchItem =  labUtils.getItemRecursive(context.typeChecker, reducerArg);

        const registeredReducer = this.createRegisteredReducer(context, name, storeModuleCall, reducerSearchItem);
        const converted = context.converter.convertRecursive2(context, reducerArg);
        devLogger.info(logColor.info('!!!!! convert storeModuleCall.arguments[1] result:'), converted);
        return registeredReducer;
    }

    private createRegisteredReducer(
        context: LabItemConvertContext,
        name: string | undefined,
        srcNode: ts.Node,
        reducer: SearchedItem | undefined
    ): RegisteredReducerItem {
        const registeredReducer = new RegisteredReducerItem(
            name || 'noName',
            srcNode.getSourceFile().fileName,
            srcNode.getStart(),
            srcNode.getEnd()
        );
        
        devLogger.info('registeredReducer', registeredReducer.name);
        
        if (reducer) {
            if (reducer.item) {
                devLogger.info('registeredReducer item: ', reducer.item);
                registeredReducer.reducerItems = reducer.item as RegisteredReducerItem[];
            } else if (reducer.symbol) {
     
                registeredReducer.reducerSymbol = reducer.symbol;
                context.symbolResolverService.addSymbolToResolve(reducer.symbol, { item: registeredReducer,propertyName: 'reducerItems'});
            }
        }
        return registeredReducer;
    }
}
