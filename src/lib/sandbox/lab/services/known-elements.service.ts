import log from 'loglevel';

import { KnownElement } from '../known-elements/known-element.model';

const logger = log.getLogger('know-element');

export class KnownElementsService {

    private  registry: KnownElement[] = [];
    private readonly cache = new Map<string, KnownElement>();


    addToRegistry(elements: KnownElement[]): void {
        this.registry = this.registry.concat(elements);
    }

    getElement(fullyQualifiedName: string): KnownElement | undefined {
        logger.warn('get: ' + fullyQualifiedName);
        let element = this.cache.get(fullyQualifiedName);
        if (element) {
            return element;
        }

        element = this.registry.find(ke => ke.match(fullyQualifiedName));
        if (element) {
            this.cache.set(fullyQualifiedName, element);
            return element;
        }
        return;
    }
}