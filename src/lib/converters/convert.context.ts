import ts, { TypeChecker } from 'typescript';

import { Converter } from './converter';
import { NamedConvertedItem, TypeKind } from './models';

export interface ConvertContextFactory {

    create(program: ts.Program, typeChecker: ts.TypeChecker, converter: Converter, lastContext?: ConvertContext): ConvertContext;
    configureConverter(converter: Converter): void;
}


export interface ConvertContext {
    getRawResult(): unknown;
    name: string;
    converter: Converter;
    typeChecker: TypeChecker;
    getResult(): Map<TypeKind, NamedConvertedItem[]> | undefined;
    addResult(convertedItem: unknown): void; 
    serializeResultToJson(): { kind: string; json: string }[] | undefined;
    isRootKind(kind: TypeKind): boolean;
}