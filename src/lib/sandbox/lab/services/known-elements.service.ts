import { KnownElement, KnownElementKinds, SimpleKnownElement } from '../known-elements/known-element.model';
import { StoreModuleForFeatureKnowElement } from '../known-elements/store-module-for-featue.know-element';

export class KnownElementsService {

    private readonly registry: KnownElement[] = [];
    private readonly cache = new Map<string, KnownElement>();

    constructor() {
        this.mock();
    }

    mock(): void {
        this.registry.push(new StoreModuleForFeatureKnowElement);
      
    //     // Effects
    //     this.registry.push(new SimpleKnownElement('@ngrx/effects/src/actions".ofType', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/effects/src/effect_creator".createEffect', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/effects/src/effects_module".EffectsModule.createFunction', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/effects/src/effects_module".EffectsModule.forFeature', KnownElementKinds.effectsForFeature));
    //     this.registry.push(new SimpleKnownElement('@ngrx/effects/src/effects_module".EffectsModule.forRoot', 999));
    //     // Entity
    //     this.registry.push(new SimpleKnownElement('@ngrx/entity/src/create_adapter".createEntityAdapter', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/entity/src/models".EntityAdapter.getInitialState', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/entity/src/models".EntityAdapter.getSelectors', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/entity/src/models".EntityStateAdapter.addMany', 999));
    //     this.registry.push(new SimpleKnownElement('@ngrx/entity/src/models".EntityStateAdapter.addOne', 999));
    //     // Router store
    //     this.registry.push(new SimpleKnownElement('@ngrx/router-store/src/router_store_module".StoreRouterConnectingModule.forRoot', 999));
    //     // devtools
    //     this.registry.push(new SimpleKnownElement('@ngrx/store-devtools/src/instrument".StoreDevtoolsModule.instrument', 999));
    //     // store
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/action_creator".createAction', KnownElementKinds.storeCreateAction));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/action_creator".props', KnownElementKinds.storeCreateActionProps));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/reducer_creator".createReducer', KnownElementKinds.storeCreateReducer));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/reducer_creator".on', KnownElementKinds.storeCreateReducerOn));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/selector".createFeatureSelector', KnownElementKinds.storeCreateFeatureSelector));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/selector".createSelector', KnownElementKinds.storeCreateSelector));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/store_module".StoreModule.createSelector', KnownElementKinds.storeModuleCreateSelector));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/store_module".StoreModule.forRoot', KnownElementKinds.storeModuleForRoot));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/store".select', KnownElementKinds.storeSelect));
    //     this.registry.push(new SimpleKnownElement('@ngrx/store/src/store".Store.dispatch', KnownElementKinds.storeDispatch));
         this.registry.push(new SimpleKnownElement('@ngrx/store/src/utils".combineReducers', KnownElementKinds.storeCombineReducers));
     }

    getElement(fullyQualifiedName: string): KnownElement | undefined {
        let element = this.cache.get(fullyQualifiedName);
        if (element) {
            return element;
        }

        element = this.registry.find(ke => fullyQualifiedName.endsWith(ke.postfix));
        if (element) {
            this.cache.set(fullyQualifiedName, element);
            return element;
        }
        return;
    }
}