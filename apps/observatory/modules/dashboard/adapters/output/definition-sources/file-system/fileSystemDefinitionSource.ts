import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  type DashboardDefinition,
  validateDefinitionRules,
} from '../../../../domain';
import type {
  DefinitionIssue,
  DefinitionSource,
  DefinitionSourceResult,
} from '../../../../use-cases';
import { dashboardDefinitionSchema } from './schemas';

export const DEFINITION_DIRECTORY_VARIABLE = 'OBSERVATORY_DASHBOARDS_DIR';
export const DEFAULT_DEFINITION_DIRECTORY = 'dashboards';

interface LoadedDefinition {
  fileName: string;
  definition: DashboardDefinition | null;
  issues: DefinitionIssue[];
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function jsonPath(path: (string | number)[]): string {
  return path.reduce<string>((result, segment) => {
    if (typeof segment === 'number') {
      return `${result}[${segment}]`;
    }
    if (result === '') {
      return segment;
    }
    return `${result}.${segment}`;
  }, '');
}

async function loadDefinitionFile(
  directory: string,
  fileName: string
): Promise<LoadedDefinition> {
  try {
    const contents = await readFile(join(directory, fileName), 'utf8');
    const parsed = dashboardDefinitionSchema.safeParse(JSON.parse(contents));
    if (!parsed.success) {
      return {
        fileName,
        definition: null,
        issues: parsed.error.issues.map((issue) => ({
          fileName,
          path: jsonPath(issue.path),
          message: issue.message,
        })),
      };
    }

    const violations = validateDefinitionRules(parsed.data);
    return violations.length === 0
      ? { fileName, definition: parsed.data, issues: [] }
      : {
          fileName,
          definition: null,
          issues: violations.map((violation) => ({
            fileName,
            path: jsonPath(violation.path),
            message: violation.message,
          })),
        };
  } catch (error) {
    return {
      fileName,
      definition: null,
      issues: [{ fileName, path: '', message: describeError(error) }],
    };
  }
}

function collectDefinitions(
  loadedDefinitions: LoadedDefinition[]
): DefinitionSourceResult {
  return loadedDefinitions.reduce<DefinitionSourceResult>(
    (result, loaded) => {
      if (loaded.definition === null) {
        return {
          definitions: result.definitions,
          issues: result.issues.concat(loaded.issues),
        };
      }

      const duplicate = result.definitions.some(
        (definition) => definition.id === loaded.definition?.id
      );
      return duplicate
        ? {
            definitions: result.definitions,
            issues: result.issues.concat(loaded.issues, {
              fileName: loaded.fileName,
              path: 'id',
              message: `Duplicate dashboard id "${loaded.definition.id}"`,
            }),
          }
        : {
            definitions: result.definitions.concat(loaded.definition),
            issues: result.issues.concat(loaded.issues),
          };
    },
    { definitions: [], issues: [] }
  );
}

export class FileSystemDefinitionSource implements DefinitionSource {
  private readonly directory: string;

  constructor(configuredDirectory?: string) {
    this.directory = configuredDirectory
      ? resolve(configuredDirectory)
      : resolve(process.cwd(), DEFAULT_DEFINITION_DIRECTORY);
  }

  async load(): Promise<DefinitionSourceResult> {
    try {
      const entries = await readdir(this.directory, { withFileTypes: true });
      const fileNames = entries
        .filter(
          (entry) =>
            (entry.isFile() || entry.isSymbolicLink()) &&
            entry.name.endsWith('.json')
        )
        .map((entry) => entry.name)
        .sort();
      return collectDefinitions(
        await Promise.all(
          fileNames.map((fileName) =>
            loadDefinitionFile(this.directory, fileName)
          )
        )
      );
    } catch (error) {
      return {
        definitions: [],
        issues: [
          {
            fileName: this.directory,
            path: '',
            message: `Could not read dashboard definitions: ${describeError(error)}`,
          },
        ],
      };
    }
  }
}
