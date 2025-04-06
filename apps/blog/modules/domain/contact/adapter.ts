import { Visitor } from './types';

export interface Adapter {
  sendEmail: (
    visitor: Visitor,
    subject: string,
    message: string
  ) => Promise<void>;
}
