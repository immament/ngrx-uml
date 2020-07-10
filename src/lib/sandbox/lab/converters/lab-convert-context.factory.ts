import chalk from 'chalk';
import log from 'loglevel';
import { Program, SyntaxKind, TypeChecker } from 'typescript';

import { ConvertContext, ConvertContextFactory, Converter } from '../../../core/converters';
import { TypeKind } from '../../../core/converters/models';
import { TypeLiteralConverter, TypeReferenceConverter } from '../../../impl/converters/node-converters';
import devLogger from '../../../utils/logger';
import { CreateActionKnownElement } from '../known-elements/create-action.known-element';
import { KnownElement } from '../known-elements/known-element.model';
import { NgModuleKnownElement } from '../known-elements/ng-module.know-element';
import { SimpleKnownElement } from '../known-elements/simple.known-element';
import { StoreModuleForFeatureKnowElement } from '../known-elements/store-module-for-feature.know-element';
import { MemorySymbolResolverService } from '../resoloved-items/memory-symbol-resolver.service';
import { KnownElementsService } from '../services/known-elements.service';

import { LabItemConvertContext } from './lab-item-convert.context';
import { KnownElementConverter } from './node-converters/known-element.converter';
import { LabSourceFileConverter } from './node-converters/lab-source-file.converter';

export class LabConvertContextFactory implements ConvertContextFactory {

    private knownElementService = new KnownElementsService();
    create(program: Program, typeChecker: TypeChecker, converter: Converter, _lastContext?: ConvertContext): ConvertContext {
        this.registerKnowElements();
        this.configureConverter(converter);

        return new LabItemConvertContext(
            'Lab',
            program,
            typeChecker,
            converter,
            [TypeKind.RegisteredReducer],
            new MemorySymbolResolverService(typeChecker),
            undefined,
            this.onFinish
        );
    }

    configureConverter(converter: Converter): void {
        converter.registerConverters({
            [SyntaxKind.CallExpression]: [new KnownElementConverter(this.knownElementService)],
            [SyntaxKind.SourceFile]: [new LabSourceFileConverter],
            [TypeKind.TypeLiteral]: [new TypeLiteralConverter],
            [TypeKind.TypeReference]: [new TypeReferenceConverter]
        }, {});
        // converter.nodeFilter = (node: ts.Node): boolean => !node.getSourceFile().fileName.includes('/ngrx/modules/');
        // node.getSourceFile().fileName.includes('books.module.ts');         
    }


    private onFinish(context: LabItemConvertContext): void {

        const result = context.getRawResult();
        if (!result.size) {
            log.info(chalk.yellow(`Nothing found in context: ${context.name}`));
        }

        for (const [kind, map] of result.entries()) {
            log.info(`Found: ${map.size} ${TypeKind[kind]}s`);
        }

    }

    private registerKnowElements(): void {

        this.knownElementService.addToRegistry([

            new NgModuleKnownElement,
            new StoreModuleForFeatureKnowElement,

            //     // Effects
            new SimpleKnownElement(['@ngrx/effects/src/actions".ofType', '"@ngrx/effects".ofType'], TypeKind.OfType, { withArgs: true }),
            new SimpleKnownElement(['@ngrx/effects/src/effect_creator".createEffect', '"@ngrx/effects".createEffect'], TypeKind.CreateEffect, { withArgs: true }),
            //new SimpleKnownElement('@ngrx/effects/src/effects_module".EffectsModule.forFeature', TypeKind.Unknown, 'EffectsModule.forFeature'),
            //new SimpleKnownElement('@ngrx/effects/src/effects_module".EffectsModule.forRoot', TypeKind.Unknown, 'EffectsModule.forRoot'),
            // Entity
            new SimpleKnownElement(['@ngrx/entity/src/create_adapter".createEntityAdapter', '"@ngrx/entity".createEntityAdapter'], TypeKind.EntityAdapter),
            //new SimpleKnownElement('@ngrx/entity/src/models".EntityAdapter.getInitialState', TypeKind.Unknown, 'EntityAdapter.getInitialState'),
            new SimpleKnownElement(['@ngrx/entity/src/models".EntityAdapter.getSelectors', '"@ngrx/entity".getSelectors'], TypeKind.EntityAdapterGetSelectors, { withArgs: true }),
            //new SimpleKnownElement('@ngrx/entity/src/models".EntityStateAdapter.addMany', TypeKind.Unknown, 'EntityStateAdapter.addMany'),
            //new SimpleKnownElement('@ngrx/entity/src/models".EntityStateAdapter.addOne', TypeKind.Unknown, 'EntityStateAdapter.addOne'),
            // // Router store
            //  new SimpleKnownElement('@ngrx/router-store/src/router_store_module".StoreRouterConnectingModule.forRoot', TypeKind.Unknown, 'StoreRouterConnectingModule.forRoot'),
            // devtools
            //new SimpleKnownElement('@ngrx/store-devtools/src/instrument".StoreDevtoolsModule.instrument', TypeKind.Unknown, 'StoreDevtoolsModule.instrument'),
            // store
            new CreateActionKnownElement(['@ngrx/store/src/action_creator".createAction', '"@ngrx/store".createAction']),
            new SimpleKnownElement(['@ngrx/store/src/action_creator".props', '"@ngrx/store".props'], TypeKind.ActionProps, { withTypeArgs: true }),
            new SimpleKnownElement(['@ngrx/store/src/reducer_creator".createReducer', '"@ngrx/store".createReducer'], TypeKind.Reducer, { withArgs: true }),
            new SimpleKnownElement(['@ngrx/store/src/reducer_creator".on', '"@ngrx/store".on'], TypeKind.ReducerOn, { withArgs: [0] }),
            new SimpleKnownElement(['@ngrx/store/src/selector".createFeatureSelector', '"@ngrx/store".createFeatureSelector'], TypeKind.CreateFeatureSelector),
            new SimpleKnownElement(['@ngrx/store/src/selector".createSelector', '"@ngrx/store".createSelector'], TypeKind.CreateSelector, { withArgs: true }),
            new SimpleKnownElement(['@ngrx/store/src/store_module".StoreModule.createSelector', '"@ngrx/store".createSelector'], TypeKind.StoreCreateSelector, { withArgs: true }),
            new SimpleKnownElement(['@ngrx/store/src/store".select', '"@ngrx/store".select'], TypeKind.StoreSelect, { withArgs: true }),
            new SimpleKnownElement(['@ngrx/store/src/store".Store.dispatch', '"@ngrx/store".dispatch'], TypeKind.StoreDispatch, { withArgs: true }),
            new SimpleKnownElement(['@ngrx/store/src/utils".combineReducers', '"@ngrx/store".combineReducers'], TypeKind.CombineReducers, { withArgs: true }),

            // others
            new SimpleKnownElement(['Observable".Observable.pipe'], TypeKind.ObservablePipe, { withArgs: true }),
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new SimpleKnownElement(['node_modules/rxjs/internal/operators'], TypeKind.RxjsOperator, { withArgs: true }, includeFqn )

        ]);
    }

}


function includeFqn(this: KnownElement, fqn: string): boolean {
    return this.postfixes.some(p => fqn.includes(p));
}
