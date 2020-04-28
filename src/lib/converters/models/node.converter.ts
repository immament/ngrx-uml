import ts from 'typescript';

import { ConvertContext } from '../convert.context';

import { ConvertedItem } from './';

export default abstract class NodeConverter {

   abstract convert(context: ConvertContext, node: ts.Node): ConvertedItem | undefined;
}