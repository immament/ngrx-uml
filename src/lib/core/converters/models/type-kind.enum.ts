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
    Reducer = 1004,
    NgModule = 1005
}
