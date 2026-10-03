import type { MediaType } from '../../domain';

export interface MediaOutput {
  id: string;
  name: string;
  type: MediaType;
  sourceFile: string | null;
  sourceUrl: string | null;
  targetUrl: string | null;
  width: number | null;
  height: number | null;
  extension: string | null;
  effectiveSource: string | null;
}
