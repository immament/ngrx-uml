import ts from 'typescript';

declare module 'typescript' {

    interface Node {
        symbol?: ts.Symbol;
        localSymbol?: ts.Symbol;
    }
}

export default '_ts';