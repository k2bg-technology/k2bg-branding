import type {
  DefinitionSource,
  DefinitionSourceResult,
} from './definitionSource';

export class LoadDashboards {
  constructor(private readonly definitionSource: DefinitionSource) {}

  execute(): Promise<DefinitionSourceResult> {
    return this.definitionSource.load();
  }
}
