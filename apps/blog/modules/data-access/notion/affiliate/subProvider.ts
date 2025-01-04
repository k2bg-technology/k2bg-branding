import { Entity } from './entity';

export class SubProvider extends Entity {
  get providerColor() {
    return this.data.getSelect('providerColor');
  }

  toObject() {
    return {
      ...super.toObject(),
      providerColor: this.providerColor,
    };
  }
}
