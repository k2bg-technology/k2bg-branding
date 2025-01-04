import { Entity } from './entity';
import { AffiliateText } from './types';

export class Text extends Entity implements AffiliateText {
  toObject() {
    return super.toObject();
  }
}
