import ts, { TypeChecker } from 'typescript';

import { Converter } from './converter';

export interface ContextFactory {
    
    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter): ConvertContext;

    configureConverter(converter: Converter): void;
}


export interface ConvertContext {
    converter: Converter;
    typeChecker: TypeChecker;
    result: unknown;
}