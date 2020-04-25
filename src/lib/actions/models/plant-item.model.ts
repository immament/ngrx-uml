export interface PlantItem {
    readonly name: string;
    toPlantUml(withReferences: boolean): string; 
}