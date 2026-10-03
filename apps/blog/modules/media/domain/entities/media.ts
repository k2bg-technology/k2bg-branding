import { InvalidMediaError } from '../errors/errors';
import type { MediaType } from '../types/enums';
import type {
  Extension,
  Height,
  MediaId,
  MediaName,
  SourceFile,
  SourceUrl,
  TargetUrl,
  Width,
} from '../value-objects';

export interface MediaProps {
  id: MediaId;
  name: MediaName;
  type: MediaType;
  sourceFile: SourceFile | null;
  sourceUrl: SourceUrl | null;
  targetUrl: TargetUrl | null;
  width: Width | null;
  height: Height | null;
  extension: Extension | null;
}

export class Media {
  private constructor(
    private readonly _id: MediaId,
    private readonly _name: MediaName,
    private readonly _type: MediaType,
    private readonly _sourceFile: SourceFile | null,
    private readonly _sourceUrl: SourceUrl | null,
    private readonly _targetUrl: TargetUrl | null,
    private readonly _width: Width | null,
    private readonly _height: Height | null,
    private readonly _extension: Extension | null
  ) {}

  get id(): MediaId {
    return this._id;
  }

  get name(): MediaName {
    return this._name;
  }

  get type(): MediaType {
    return this._type;
  }

  get sourceFile(): SourceFile | null {
    return this._sourceFile;
  }

  get sourceUrl(): SourceUrl | null {
    return this._sourceUrl;
  }

  get targetUrl(): TargetUrl | null {
    return this._targetUrl;
  }

  get width(): Width | null {
    return this._width;
  }

  get height(): Height | null {
    return this._height;
  }

  get extension(): Extension | null {
    return this._extension;
  }

  /** A file source takes priority when both source forms are present. */
  getEffectiveSource(): string | null {
    if (this._sourceFile) {
      return this._sourceFile.getValue();
    }
    if (this._sourceUrl) {
      return this._sourceUrl.getValue();
    }
    return null;
  }

  hasSource(): boolean {
    return this._sourceFile !== null || this._sourceUrl !== null;
  }

  equals(other: Media): boolean {
    return this._id.equals(other._id);
  }

  static create(props: MediaProps): Media {
    if (!props.sourceFile && !props.sourceUrl) {
      throw new InvalidMediaError(
        'Media must have either a source file or source URL'
      );
    }

    return new Media(
      props.id,
      props.name,
      props.type,
      props.sourceFile,
      props.sourceUrl,
      props.targetUrl,
      props.width,
      props.height,
      props.extension
    );
  }

  static reconstitute(props: MediaProps): Media {
    return new Media(
      props.id,
      props.name,
      props.type,
      props.sourceFile,
      props.sourceUrl,
      props.targetUrl,
      props.width,
      props.height,
      props.extension
    );
  }
}
