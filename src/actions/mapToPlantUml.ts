import { EOL } from 'os';

import { writeToFile } from '../utils/utils';
import { Action } from './models/action.model';

function writeDiagramToFile(name: string, diagramContent: string, outDir: string): void{
    const diagram = `@startuml ${name}
    set namespaceSeparator ::
    ${diagramContent} ${EOL}@enduml`;

    name = name.replace(/[<>:"/\\|?*]/g, ' ');
    writeToFile(diagram, outDir, name + '.wsd');
}

export function writeDiagramsToFiles(actions: Action[], outDir: string): void {
    for (const action of actions) {
        const diagramContent = action.toPlantUml(true);
        writeDiagramToFile(action.name, diagramContent, outDir);
    }
}
