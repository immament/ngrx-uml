import ts from 'typescript';

import { ConvertedItem } from '../../models/convertet-item.model';
import { ConvertContext } from '../convert.context';

export default abstract class NodeConverter {

   abstract convert(context: ConvertContext, node: ts.Node): ConvertedItem | undefined;
}