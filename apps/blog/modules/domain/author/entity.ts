import type { Author } from './types';

export class Entity {
  constructor(readonly data: Author) {}

  toObject() {
    return this.data;
  }
}
