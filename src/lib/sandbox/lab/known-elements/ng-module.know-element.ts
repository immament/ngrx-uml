import log from 'loglevel';
import ts from 'typescript';

import { NamedConvertedItem, TypeKind } from '../../../core/converters/models';
import { NgModule } from '../../../core/converters/models/converted-items/ng-module.model';
import { syntaxKindText } from '../../../utils';
import { SymbolResolveItem } from '../../converters/models/symbol-resolve.item';
import { LabItemConvertContext } from '../converters/lab-item-convert.context';

import { KnownElement } from './known-element.model';

export class NgModuleKnownElement extends KnownElement {
    readonly postfixes = ['@angular/core/core".NgModule'];


    work(context: LabItemConvertContext, node: ts.Node): NamedConvertedItem | undefined {

        if (ts.isCallExpression(node)) {

            const ngModule = this.createNgModule(context, node);
            if (!ngModule) {
                return;
            }

            KnownElement.devLogger.error('MODULE: ' + ngModule.name);

            this.parseArguments(context, node.arguments, ngModule);
            this.resolveParentSymbol(context, node, ngModule);
            return ngModule;


        }
        return;
    }

    createNgModule(_context: LabItemConvertContext, node: ts.CallExpression): NgModule | undefined {

        const classDeclaration = node.parent.parent;
        if (ts.isClassDeclaration(classDeclaration)) {
            return new NgModule(classDeclaration.name?.getText().trim(), classDeclaration.getSourceFile().fileName, classDeclaration.getStart(), classDeclaration.getEnd());
        } else {
            NgModuleKnownElement.devLogger.error('  createNgModule failed:', syntaxKindText(node.parent));

        }
        return;
    }

    parseArguments(context: LabItemConvertContext, args: ts.NodeArray<ts.Expression>, ngModule: NgModule): void {

        if (args.length === 0) {
            log.warn('No NgModule decorator arguments');
            return;
        }
        const resolved = context.converter.getResolvedItem(context, args[0]);

        if (!resolved) {
            NgModuleKnownElement.devLogger.warn('- NgModule sub items not found');
            return;
        }


        for (const resolveItem of resolved) {

            switch (resolveItem.kind) {
                case TypeKind.SymbolResolveItem: {
                    const symbolResolveItem = resolveItem as SymbolResolveItem;
                    symbolResolveItem.addReference({ item: ngModule, propertyName: 'registeredItems', addToArray: true });
                    break;
                }
                case TypeKind.RegisteredReducer:
                    ngModule.registeredItems.push(resolveItem);
                    break;
                case TypeKind.Unknown:
                    ngModule.registeredItems.push(resolveItem);
                    break;
                default:
                    NgModuleKnownElement.devLogger.warn('- Unknown kind:', resolveItem.kindText);
                    break;
            }
        }
    }


}
