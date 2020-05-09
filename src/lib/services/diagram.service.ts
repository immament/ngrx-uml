export interface DiagramService {
    generateDiagram(filesPattern: string): Promise<void>;
} 