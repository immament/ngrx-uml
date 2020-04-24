import chalk from 'chalk';
import { EOL } from 'os';

import {
    CallExpression, NamedType, TypeKind, TypeLiteral, TypeReference
} from '../../../converters/models/type.model';
import { getFileName } from '../../../utils/utils';
import { ActionReference } from '../../models/action-reference.model';
import { Action } from '../../models/action.model';
import { ItemRenderer } from '../items/item.renderer';

export class ActionRenderer implements ItemRenderer {

   
    render(item: Action): any {
        if(item instanceof Action) {
            return this.toPlantUml(item);
        }
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
        // if (withReferences) {
        //     diagramContent += item.referencesToPlantUml();
        // }

        return diagramContent;

    }


    private referencesToPlantUml(item: Action): string | undefined {
        if (item.references && item.references.length) {
            let diagramContent = '';
            for (const ref of item.references) {
                diagramContent += ref.toPlantUml() + this.linkToPlantUml(item, ref);
            }
            return diagramContent;
        }
        return '';
    }

    private linkToPlantUml(item: Action, ref: ActionReference): string {
        return `"${item.name}" ${ref.isCall ? '-down->' : '<.down.'} "${ref.fileName} ${ref.isCall ? 'D' : 'L'}"${EOL}`;
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