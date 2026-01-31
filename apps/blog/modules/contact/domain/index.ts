export { Contact } from './entities/contact';
export type { ContactProps } from './entities/contact';
export {
  DomainError,
  InvalidEmailError,
  InvalidMessageError,
  InvalidNameError,
} from './errors/errors';
export type { EmailSender } from './repositories/emailSender';
export type { ContactVisitor } from './types';
export { Email, Message, Name } from './value-objects';
