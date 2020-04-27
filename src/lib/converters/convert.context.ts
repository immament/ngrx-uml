import ts, { TypeChecker } from 'typescript';

import { Converter } from './converter';
import { ConvertedItem } from './models';

export interface ConvertContextFactory {

    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter, lastContext?: ConvertContext): ConvertContext;
    configureConverter(converter: Converter): void;
}


export interface ConvertContext {
    getRawResult(): unknown;
    name: string;
    converter: Converter;
    typeChecker: TypeChecker;
    getResult(): ConvertedItem[] | undefined;
    serializeResultToJson(): string | undefined;
}