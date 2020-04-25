
import { EOL } from 'os';

import {
    CallExpression, NamedType, TypeKind, TypeLiteral, TypeReference
} from '../../../converters/models/type.model';
import { getFileName } from '../../../utils/utils';
import { Action } from '../../models/action.model';

import { ItemRenderer } from './item.renderer';

export class ActionRenderer implements ItemRenderer {

   
    render(item: Action): string {
            return this.toPlantUml(item);
    }



    toPlantUml(item: Action): string {

        const fileName = getFileName(item.filePath);
        const srcText = fileName ? `src: ${fileName}` : '';

        const createActionArgs = this.createActionArgsToText(item) || '';

        const diagramContent = `interface "${item.name}" << (A,#FF7700) action >> {
            variable: ${item.variable}
            ${srcText}
            --
            ${createActionArgs}
        }

        `;

        return diagramContent;
    }



    private typeLiteralToText(typeLiteral: TypeLiteral): string | undefined {
        const properties = typeLiteral.properties;
        if (properties && properties.length > 0) {
            const typePrefix = properties.length === 1 ? '' : '\\t';

            const propertiesText = properties.map(p => `${typePrefix}${p.name}: ${p.type}`).join(EOL);
            if (properties.length === 1) {
                return `{${propertiesText}}`;
            } else {
                return `{${EOL}${propertiesText}${EOL}}`;
            }
        }
    }

    private callExpressionToText(callExpression: CallExpression): string | undefined {

        if (!callExpression.typeArguments) {
            return;
        }
        const mappedArgs = [];

        for (const arg of callExpression.typeArguments) {

            switch (arg.kind) {
                case TypeKind.TypeLiteral:
                    mappedArgs.push(this.typeLiteralToText(arg));
                    break;
                case TypeKind.TypeReference:
                    mappedArgs.push((arg as TypeReference).name);
                    break;
                default:
                    mappedArgs.push(arg.kindText);
            }
        }
        return `${callExpression.name}<${mappedArgs.join(', ')}>`;
    }

    private createActionArgsToText(item: Action): string | undefined {
        if (item.createActionArgs && item.createActionArgs.length) {

            let resultText = '';
            for (const arg of item.createActionArgs) {
                if (arg instanceof CallExpression) {
                    resultText += this.callExpressionToText(arg) + EOL;
                } else
                    if (arg instanceof NamedType) {
                        resultText += `createFunction: ${arg.name || ''} ${arg.kindText || ''}`;
                    }
            }
            return resultText;
        }
    }

    
} 