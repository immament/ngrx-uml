import { requestImageFile } from '../actions/mapToPlantUml';

function testPlantServer(outDir = 'out'): void {
    requestImageFile(outDir, 'test', 'png', `
@startuml


interface "[Auth/API] Login Failure" << (A,#FF7700) action >> {
    variable: loginFailure
    src: auth-api.actions
    ..
    props<{
    \\terror: any,
    \\tbooks: Books[],
    }>
    createFunction: arrow
}

@enduml
`
    );
}

export default testPlantServer;

// class Car

// Driver - Car : drives >
// Car *- Wheel : have 4 >
// Car -- Person : < owns