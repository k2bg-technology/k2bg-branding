import { Core } from './core';
import { MediaVideo } from './interfaces';

export class Video extends Core implements MediaVideo {
  toObject() {
    return super.toObject();
  }
}
