import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem } from '../../../core/converters/models';
import { NgModule } from '../../../core/converters/models/converted-items/ng-module.model';
import { NodeConverter } from '../../../core/converters/node.converter';
import { ItemWithSymbol } from '../../../impl/models';
import { prepareToPrint } from '../../../utils/preparet-to-print';

export class NgModuleConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.ClassDeclaration): NamedConvertedItem | undefined {
        const sourceFile = node.getSourceFile();

        const decorator = this.getModuleDecorator(context, node);
        if (decorator && node.name) {

            const symbol = context.typeChecker.getSymbolAtLocation(node.name);
            if (symbol) {
                // log.info(context.typeChecker.getSymbolAtLocation(decorator));
                const item = new NgModule(node.name.getText(), sourceFile.fileName, node.pos, node.end);
                // log.info(item.name, chalk.gray(item.filePath));
                this.getReducersFromDecorator(context, decorator);
                context.addResult({ symbol, item } as ItemWithSymbol);
            }
        }
        return;
    }


    private getModuleDecorator(_context: ConvertContext, node: ts.ClassDeclaration): ts.Decorator | undefined {
        if (node.decorators) {
            return node.decorators.find(decorator => this.isNgModuleDecorator(decorator));
        }
        return;
    }

    private isNgModuleDecorator(decorator: ts.Decorator): boolean {
        return ts.isCallExpression(decorator.expression)
            && decorator.expression.expression.getText() === 'NgModule';
    }


    private extractArgName(exp: ts.Expression): any {
        switch (exp.kind) {
            case ts.SyntaxKind.PropertyAccessExpression:
                console.log(prepareToPrint(exp)
                );
                break;
        }

    }

    private storeModule(context: ConvertContext, storeModuleCall: ts.CallExpression): void {
        log.info('-----------------');
        let callName: string;

        const callSymbol = context.typeChecker.getSymbolAtLocation(storeModuleCall.expression);
        if (callSymbol) {
            callName = callSymbol.getName();
            console.log('call', callSymbol.getName());


        } else {
            callName = storeModuleCall.expression.getText();
        }


        switch (callName) {
            case 'forFeature':
                this.extractArgName(storeModuleCall.arguments[0]);
                break;
            case 'forRoot':
                break;
            default:
                log.warn('StoreModule not supported call:', callName);
                break;
        }

        // const nameOfDeclaration = ts.getNameOfDeclaration(storeModuleCall);
        // log.info('getNameOfDeclaration', nameOfDeclaration?.getText());

        // const args = storeModuleCall.get.map(a => {
        //     const symbol = context.typeChecker.getSymbolAtLocation(a);
        //     return symbol && prepareToPrint(symbol);
        // }).filter(a => !!a);



        // et val = (args[1] as any).declarations[0].body.statements[0].expression.expression.arguments[0].properties[0].initializer;

        //  val = context.typeChecker.getSymbolAtLocation(val);
        //log.info(util.inspect(args, { colors: true, depth: 5 }));
    }

    private importsProperty(context: ConvertContext, importsProperty: ts.PropertyAssignment): void {
        if (!ts.isArrayLiteralExpression(importsProperty.initializer)) {
            return;
        }

        for (const el of importsProperty.initializer.elements) {
            if (ts.isCallExpression(el) && ts.isPropertyAccessExpression(el.expression)) {
                switch (el.expression.expression.getText()) {
                    case 'StoreModule': {
                        this.storeModule(context, el);
                    }
                }
            }

        }

    }

    private getImportsProperty(expression: ts.ObjectLiteralExpression): ts.PropertyAssignment | undefined {
        const importsProperty = expression.properties.find(p => p.name?.getText() === 'imports');
        if (importsProperty && ts.isPropertyAssignment(importsProperty)) {
            return importsProperty;
        }
        return;

    }

    private decoratorArgument(context: ConvertContext, arg: ts.Expression): void {
        if (ts.isObjectLiteralExpression(arg)) {

            const importsProperty = this.getImportsProperty(arg);
            if (importsProperty) {
                this.importsProperty(context, importsProperty);
            }
        }
    }

    private getReducersFromDecorator(context: ConvertContext, decorator: ts.Decorator): any {
        if (ts.isCallExpression(decorator.expression)) {

            decorator.expression.arguments.forEach(arg => {
                this.decoratorArgument(context, arg);
            });
        }
    }
}
