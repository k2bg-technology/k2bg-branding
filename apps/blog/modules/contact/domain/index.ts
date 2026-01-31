export type { ContactProps } from './entities/contact';
export { Contact } from './entities/contact';
export {
  DomainError,
  EmailSendError,
  InvalidEmailError,
  InvalidMessageError,
  InvalidNameError,
} from './errors/errors';
export type { EmailSender } from './repositories/emailSender';
export type { Visitor } from './types';
export { Email, Message, Name } from './value-objects';
