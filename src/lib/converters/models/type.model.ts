import ts from 'typescript';

export enum TypeKind {
    Unknown = ts.SyntaxKind.Unknown,
    TypeLiteral = ts.SyntaxKind.TypeLiteral,
    ExpressionWithTypeArguments = ts.SyntaxKind.ExpressionWithTypeArguments,
    TypeReference = ts.SyntaxKind.TypeReference,
    CallExpression = ts.SyntaxKind.CallExpression,
    VariableDeclaration = ts.SyntaxKind.VariableDeclaration,
    Identifier = ts.SyntaxKind.Identifier,
    PropertyAccessExpression = ts.SyntaxKind.PropertyAccessExpression,
    TypeArgument = 1001,
    Action = 1002,
    ActionReference = 1003,
}

export interface ConvertedItem {
    readonly kind: TypeKind;
    readonly kindText: string;

    getChildren(): ConvertedItem[];
}

export class NamedType implements ConvertedItem  {
    readonly kind: TypeKind = TypeKind.Unknown;
    constructor(
        public readonly kindText: string,
        public readonly name?: string
    ) {
    }
    getChildren(): ConvertedItem[] {
        return [];
    }

}

export interface Property {
    name: string;
    type?: string;
}

export class TypeArgument implements ConvertedItem {
    readonly kind = TypeKind.TypeArgument;
    kindText = 'TypeArgument';
    getChildren(): ConvertedItem[] {
        return [];
    }
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


export class CallExpression implements ConvertedItem {
    readonly kind = TypeKind.CallExpression;
    kindText = 'CallExpression';

    constructor(
        public name?: string,
        public typeArguments?: TypeArgument[]
    ) {
    }

    getChildren(): ConvertedItem[] {
        return [];
    }
}
