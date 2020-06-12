import ts from 'typescript';

export interface DocEntry {
    name?: string;
    fileName?: string;
    documentation?: string;
    type?: string;
    constructors?: DocEntry[];
    parameters?: DocEntry[];
    returnType?: string;
}


/** Serialize a symbol into a json object */
export function serializeSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): DocEntry {
    return symbol.valueDeclaration && {
        name: symbol.getName(),
        // documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        type: checker.typeToString(
            checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
        )
    };
}

/** Serialize a signature (call or construct) */
export function serializeSignature(signature: ts.Signature, checker: ts.TypeChecker): DocEntry {
    return {
        parameters: signature.parameters.map(p => serializeSymbol(p, checker)),
        returnType: checker.typeToString(signature.getReturnType()),
        // documentation: ts.displayPartsToString(signature.getDocumentationComment(checker))
    };
}

/** Serialize a class symbol information */
export function serializeClass(symbol: ts.Symbol, checker: ts.TypeChecker): DocEntry {
    const details = serializeSymbol(symbol, checker);

    if (symbol.valueDeclaration) {
        // Get the construct signatures
        const constructorType = checker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration
        );
        details.constructors = constructorType
            .getConstructSignatures()
            .map(s => serializeSignature(s, checker));
    }
    return details;
}
