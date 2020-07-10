import chalk from 'chalk';
import log from 'loglevel';
import ts from 'typescript';

import { ConvertContext } from '../../../core/converters';
import { NamedConvertedItem } from '../../../core/converters/models';
import { NgModule } from '../../../core/converters/models/converted-items/ng-module.model';
import { NodeConverter } from '../../../core/converters/node.converter';
import { ItemWithSymbol } from '../../../impl/models';
import { RegisteredReducerItem } from '../models/registered-reducer.item';

import { RegisterReducerCallConverter } from './register-reducer-call.converter';

export class NgModuleConverter extends NodeConverter {

    convert(context: ConvertContext, node: ts.ClassDeclaration): NamedConvertedItem | undefined {
        const sourceFile = node.getSourceFile();

        const decorator = this.getModuleDecorator(context, node);
        if (decorator && node.name) {

            const symbol = context.typeChecker.getSymbolAtLocation(node.name);
            if (symbol) {
                // log.info(context.typeChecker.getSymbolAtLocation(decorator));
                const item = new NgModule(node.name.getText(), sourceFile.fileName, node.getStart(), node.getEnd());
                // log.warn('node start', node.getStart(), ' / ',  node.getEnd(), ' / ',node.getFullStart(), node.pos, node.end , node.getLeadingTriviaWidth());
                // log.info(item.name, chalk.gray(item.filePath));

                item.registeredReducers = this.getReducersFromDecorator(context, decorator);
                context.addResult({ symbol, item } as ItemWithSymbol);
                return item;
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


    private extractStoreModuleCall(context: ConvertContext, storeModuleCall: ts.CallExpression): RegisteredReducerItem | undefined {
        return new RegisterReducerCallConverter().convert(context, storeModuleCall) as RegisteredReducerItem;
    }

    private extractImportsProperty(context: ConvertContext, importsProperty: ts.PropertyAssignment): RegisteredReducerItem[] | undefined {
        if (!ts.isArrayLiteralExpression(importsProperty.initializer)) {
            return;
        }

        const registeredReducers = [];
        for (const el of importsProperty.initializer.elements) {
            if (ts.isCallExpression(el) && ts.isPropertyAccessExpression(el.expression)) {
                switch (el.expression.expression.getText()) {
                    case 'StoreModule': {
                        const result = this.extractStoreModuleCall(context, el);
                        if (result) {
                            registeredReducers.push(result);
                        } else {
                            log.warn(chalk.yellow('StoreModule call without reducer'), el.getText());
                        }
                        // context.converter.convertNode(context, el);
                    }
                }
            }

        }

        return registeredReducers.length ? registeredReducers : undefined;

    }

    private getImportsProperty(expression: ts.ObjectLiteralExpression): ts.PropertyAssignment | undefined {
        const importsProperty = expression.properties.find(p => p.name?.getText() === 'imports');
        if (importsProperty && ts.isPropertyAssignment(importsProperty)) {
            return importsProperty;
        }
        return;

    }

    private getReducersFromDecoratorArgument(context: ConvertContext, arg: ts.Expression): RegisteredReducerItem[] | undefined {
        if (ts.isObjectLiteralExpression(arg)) {

            const importsProperty = this.getImportsProperty(arg);
            if (importsProperty) {
                return this.extractImportsProperty(context, importsProperty);
            }
        }
        return;
    }

    private getNgModuleMetadata(decorator: ts.Decorator): ts.Expression | undefined {
        if (ts.isCallExpression(decorator.expression)) {
            return decorator.expression.arguments[0];
        }
        return;

    }

    private getReducersFromDecorator(context: ConvertContext, decorator: ts.Decorator): RegisteredReducerItem[] | undefined {
            const ngModuleMetadata = this.getNgModuleMetadata(decorator);
            return ngModuleMetadata && this.getReducersFromDecoratorArgument(context, ngModuleMetadata);
    }
}
