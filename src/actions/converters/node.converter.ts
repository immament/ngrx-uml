import ts from 'typescript';

import { ConvertContext } from '../convert-context';
import { ConvertedItem } from '../models/convertet-item.model';

export default abstract class NodeConverter {

   abstract convert(context: ConvertContext, node: ts.Node): ConvertedItem | undefined;
}