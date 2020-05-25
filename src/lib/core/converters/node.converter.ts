import { Node } from 'typescript';

import { ConvertContext } from './convert.context';
import { ConvertedItem } from './models';

export abstract class NodeConverter {

   abstract convert(context: ConvertContext, node: Node): ConvertedItem | undefined;
}