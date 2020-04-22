import { EOL } from 'os';

import { getFileName } from '../../utils/utils';
import { ActionReference } from './action-reference.model';
import { ConvertedItem } from './convertet-item.model';
import { PlantItem } from './plant-item.model';
import { CallExpression, NamedType, TypeKind, TypeLiteral, TypeReference } from './type.model';

export class Action implements PlantItem, ConvertedItem {
    variable?: string;
    filePath?: string;
    references?: ActionReference[];
    type?: string;
    createActionArgs?: NamedType[];

    constructor(public readonly name: string) { }

    toPlantUml(withReferences = false): string {

        const fileName = getFileName(this.filePath);
        const srcText = fileName ? `src: ${fileName}` : '';

        const createActionArgs = this.createActionArgsToText() || '';

        let diagramContent = `interface "${this.name}" << (A,#FF7700) action >> {
            variable: ${this.variable}
            ${srcText}
            --
            ${createActionArgs}
        }
        
        `;
        if (withReferences) {
            diagramContent += this.referencesToPlantUml();
        }

        return diagramContent;

    }

    addReferece(reference: ActionReference): void {
        if (!this.references) {
            this.references = [];
        }
        this.references.push(reference);
    }

    private referencesToPlantUml(): string | undefined {
        if (this.references && this.references.length) {
            let diagramContent = '';
            for (const ref of this.references) {
                diagramContent += ref.toPlantUml() + this.linkToPlantUml(ref);
            }
            return diagramContent;
        }
        return '';
    }

    private linkToPlantUml(ref: ActionReference): string {
        return `"${this.name}" ${ref.isCall ? '-down->' : '<.down.'} "${ref.fileName} ${ref.isCall ? 'D' : 'L'}"${EOL}`;
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

    private createActionArgsToText(): string | undefined {
        if (this.createActionArgs && this.createActionArgs.length) {

            let resultText = '';
            for (const arg of this.createActionArgs) {
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