import ts from 'typescript';

import { NamedConvertedItem } from '../../../core/converters/models';
import { Action } from '../../../impl/models';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import labUtils from '../lab-utils';

import { KnownElement } from './known-element.model';

export class CreateActionPropsKnownElement extends KnownElement {
    constructor(
        public readonly postfixes: string[]
    ) {
        super();
    }

    work(context: LabItemConvertContext, node: ts.CallExpression): NamedConvertedItem | undefined {
        KnownElement.devLogger.debug('+', labUtils.nodeText(node));

        const [nameArg] = node.arguments;
        const name = labUtils.getValue<string>(context.typeChecker, nameArg);

        const convertedItem = new Action(name || 'NO_NAME', node.getSourceFile().fileName, node.pos, node.end);

        // context.converter.getResolvedItem(context, node, -1);


        this.resolveParentSymbol(context, node, convertedItem);

        return convertedItem;
    }

}
