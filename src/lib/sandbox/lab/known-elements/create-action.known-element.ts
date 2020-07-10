import ts from 'typescript';

import { TypeKind } from '../../../core/converters/models';
import { Action } from '../../../impl/models';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';
import labUtils from '../lab-utils';
import { NamedConvertedItemWithChild } from '../models/model';

import { SimpleKnownElement } from './simple.known-element';

export class CreateActionKnownElement extends SimpleKnownElement {
    constructor(
        postfixes: string[]
    ) {
        super(postfixes, TypeKind.Action, { withArgs: [1] });
    }

    protected createConvertedItem(context: LabItemConvertContext, node: ts.CallExpression, _symbol: ts.Symbol): NamedConvertedItemWithChild {
        const [nameArg] = node.arguments;
        const name = labUtils.getValue<string>(context.typeChecker, nameArg);

        const convertedItem = new Action(name || 'NO_NAME', node.getSourceFile().fileName, node.pos, node.end) as unknown as NamedConvertedItemWithChild;

        convertedItem.childs = [];
        return convertedItem;
    }

}
