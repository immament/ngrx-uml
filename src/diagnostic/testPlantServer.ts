import { requestImageFile } from '../actions/mapToPlantUml';

export function testPlantServer(outDir = 'out'): void {
    requestImageFile(outDir, 'test', 'png', `
@startuml
class Car

Driver - Car : drives >
Car *- Wheel : have 4 >
Car -- Person : < owns

@enduml
`
    );
}