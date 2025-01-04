import { Entity } from './entity';
import { MediaVideo } from './types';

export class Video extends Entity implements MediaVideo {
  toObject() {
    return super.toObject();
  }
}
