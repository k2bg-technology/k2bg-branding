import { Core } from './core';
import { Text } from './text';
import { Banner } from './banner';
import { Product } from './product';
import { SubProvider } from './subProvider';

const Affiliate = {
  Text,
  Banner,
  Product,
  SubProvider,
  getType: Core.getType,
};

export default Affiliate;
