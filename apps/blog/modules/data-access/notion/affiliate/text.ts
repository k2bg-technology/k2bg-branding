import { Entity } from './entity';
import type { AffiliateText } from './types';

export class Text extends Entity implements AffiliateText {
  toObject() {
    return super.toObject();
  }
}
