import type { Post } from './types';

export class Entity {
  constructor(readonly data: Post) {}

  toObject() {
    return this.data;
  }
}
