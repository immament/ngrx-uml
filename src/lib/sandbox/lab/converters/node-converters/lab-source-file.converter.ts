
import ts from 'typescript';

import { ConvertContext } from '../../../../core/converters';
import { NamedConvertedItem } from '../../../../core/converters/models';
import { NodeConverter } from '../../../../core/converters/node.converter';

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const _knownsKinds = {} as any;


// CallExpression - expression:  PropertyAccessExpression | ImportKeyword | Identifier | CallExpression

export class LabSourceFileConverter extends NodeConverter {

    convert(_context: ConvertContext, _node: ts.SourceFile): NamedConvertedItem | undefined {
     //   devLogger.warn('sourceFile', path.basename(node.fileName));

        return;
    }
}