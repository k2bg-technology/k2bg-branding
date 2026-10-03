import type { DashboardDefinition } from '../../../domain';
import type { DefinitionIssue } from '../../shared';

export interface DefinitionSourceResult {
  definitions: DashboardDefinition[];
  issues: DefinitionIssue[];
}

export interface DefinitionSource {
  load(): Promise<DefinitionSourceResult>;
}
