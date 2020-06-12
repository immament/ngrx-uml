import { useCreateActionsDiagramService } from './use-create-actions-diagram-service';
import { useGeneratorService } from './use-generator-service';

async function main(): Promise<void> {

    await useCreateActionsDiagramService();
    await useGeneratorService();
}

main();