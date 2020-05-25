

import { SyntaxKind } from 'typescript';

import { syntaxKindText } from './tsutils';

export function prepareToPrint(node: object): unknown {
    const ignoreKeys = ['parent', 'pos', 'end', 'flags', 'modifierFlagsCache', 'transformFlags', 'flowNode'];


    const refs: object[] = [];

    function prepare(node: object, level = 0): unknown {
        if (refs.includes(node)) {
            const anyNode = node as {id: string; kind: number };
            return `circular [${anyNode.id||''}/${anyNode.kind||''}]`;
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
                acc[key] = value;
                return acc;

            }, {  } as { [key: string]: unknown });
        const anyNode = node as {id: string; kind: SyntaxKind };
        reduced.kindText = syntaxKindText(anyNode);
        return reduced;

    }

    return prepare(node);

}



// export function prepareToPrint(node: ts.Node): unknown {
//     const ignoreKeys = ['parent', 'pos', 'end', 'flags', 'modifierFlagsCache', 'transformFlags', 'flowNode'];


//     const refs: ts.Node[] = [];

//     function prepareNode(node: ts.Node, level = 0): unknown {
//         if (refs.includes(node)) {
//             return 'circular';
//         }
//         refs.push(node);
//         const reduced = Object.entries(node)
//             .filter(([key]) => !ignoreKeys.includes(key))
//             .reduce((acc, [key, value]) => {

//                 if (Array.isArray(value)) {
//                     value = value.map(v => prepareNode(v, level + 1));
//                 } else {
//                     if (typeof value === 'object') {
//                         value = prepareNode(value, level + 1);
//                     }
//                 }
//                 acc[key] = value;
//                 return acc;

//             }, { kindText: syntaxKindText(node) } as { [key: string]: unknown });

//         return reduced;

//     }

//     return prepareNode(node);

// }
