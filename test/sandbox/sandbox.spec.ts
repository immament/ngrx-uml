import path from 'path';

describe('sandbox', () => {

    const base = path.join(__dirname, 'sandbox-converter_data');

    function createPathToTestFile(fileName: string): string {
        return path.join(base, fileName);
    }

    it('Should ....', () => {
       // new NgNoduleConverter();

       // const testFilePath = createPathToTestFile('one-action.actions.ts');

        // const expectedActions = toActions([{
        //     name: '[Book Exists Guard] Load Book',
        //     variable: 'loadBook',
        //     filePath: testFilePath
        // }]);

        // convertFileTest(testFilePath, expectedActions);


    });
});