import { Core } from './core';

export class SubProvider extends Core {
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
