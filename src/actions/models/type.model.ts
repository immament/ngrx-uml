import ts from 'typescript';

export enum TypeKind {
    Unknown = ts.SyntaxKind.Unknown,
    TypeLiteral = ts.SyntaxKind.TypeLiteral,
    ExpressionWithTypeArguments = ts.SyntaxKind.ExpressionWithTypeArguments,
    TypeReference = ts.SyntaxKind.TypeReference,
    CallExpression = ts.SyntaxKind.CallExpression,
    TypeArgument = 1001
}

export class Type {
    readonly kind: TypeKind = TypeKind.Unknown;
    readonly kindText: string = 'Unknown';
}

export class NamedType extends Type {
    readonly kind: TypeKind = TypeKind.Unknown;
    constructor(
        public readonly kindText: string,
        public readonly name?: string
    ) {
        super();
    }
}

export interface Property {
    name: string;
    type?: string;
}

export class TypeArgument extends Type {
    readonly kind = TypeKind.TypeArgument;
    kindText = 'TypeArgument';
}
export class TypeReference extends TypeArgument {
    readonly kind = TypeKind.TypeReference;
    kindText = 'TypeReference';
    constructor(public name: string) {
        super();
    }
}

export class TypeLiteral extends TypeArgument {
    readonly kind = TypeKind.TypeLiteral;
    kindText = 'TypeLiteral';
    constructor(public properties?: Property[]) {
        super();
    }
}


export class CallExpression extends Type {
    readonly kind = TypeKind.CallExpression;
    kindText = 'CallExpression';

    constructor(
        public name?: string,
        public typeArguments?: TypeArgument[]
    ) {
        super();
    }
}
