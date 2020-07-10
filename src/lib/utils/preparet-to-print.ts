

import { Node, SyntaxKind } from 'typescript';
import util from 'util';

import { syntaxKindText } from './tsutils';

function createNodeObj(node: object): { [key: string]: unknown } {
    const anyNode = node as { kind: SyntaxKind };
    return anyNode.kind ? { kindText: `${syntaxKindText(anyNode) || ''} (${anyNode.kind})` } : {};
}

export function prepareToPrint(node: object | undefined, ignoreKeysArg?: string[]): unknown {

    if (!node) {
        return;
    }

    const ignoreKeys = ignoreKeysArg ? ignoreKeysArg : ['parent',
        'pos',
        'end',
        'flags',
        'modifierFlagsCache',
        'transformFlags',
        'flowNode',
        'kind',
        'checker'
    ];


    const refs: object[] = [];

    function prepare(node: object, level = 0): unknown {
        if (refs.includes(node)) {
            const anyNode = node as { id: string; kind: number };
            return `circular [${anyNode.id || ''}/${anyNode.kind || ''}]`;
        }
        refs.push(node);

        const reduced = Object.entries(node)
            .filter(([key]) => !ignoreKeys.includes(key))
            .reduce((acc, [key, value]) => {

                if (Array.isArray(value)) {
                    value = value.map(v => prepare(v, level + 1));
                } else {
                    if (typeof value === 'object') {
                        value = prepare(value, level + 1);
                    }
                }
                if (value) {
                    acc[key] = value;
                }
                return acc;

            }, createNodeObj(node));
        return reduced;

    }

    return prepare(node);

}

export function printNode(node: object | undefined, level = 3, ignoreKeysArg?: string[]): string | undefined {
    return node && util.inspect(prepareToPrint(node, ignoreKeysArg), false, level, true);
}

export interface SimpleNode {
    kindText: string;
    childs?: SimpleNode[];
}

export function prepareToPrintChilds(node?: Node): SimpleNode | undefined {

    if (!node) {
        return undefined;
    }

    function prepare(node: Node, level = 0): SimpleNode {
        const reduced: SimpleNode = { kindText: syntaxKindText(node) };
        const childs = node.getChildren().map(child => prepare(child, level + 1));
        if (childs.length) {
            reduced.childs = childs;
        }
        return reduced;
    }

    return prepare(node);

}


