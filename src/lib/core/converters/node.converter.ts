import log from 'loglevel';
import { Node } from 'typescript';

import { ConvertContext } from './convert.context';
import { ConvertedItem } from './models';

export abstract class NodeConverter {

   static devLogger = log.getLogger('node-converter');

   abstract convert(context: ConvertContext, node: Node): ConvertedItem | undefined;
}