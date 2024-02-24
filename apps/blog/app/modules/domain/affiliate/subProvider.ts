import { Core } from './core';

export class SubProvider extends Core {
  get providerColor() {
    const providerColor = this.data.getSelect('providerColor');

    if (providerColor) return providerColor;

    throw new Error('Affiliate providerColor is required');
  }
}
