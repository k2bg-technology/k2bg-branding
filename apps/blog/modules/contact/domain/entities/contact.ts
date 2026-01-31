import type { Email } from '../value-objects/email';
import type { Message } from '../value-objects/message';
import type { Name } from '../value-objects/name';

export interface ContactProps {
  name: Name;
  email: Email;
  message: Message;
}

export class Contact {
  private constructor(
    private readonly _name: Name,
    private readonly _email: Email,
    private readonly _message: Message
  ) {}

  get name(): Name {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get message(): Message {
    return this._message;
  }

  static create(props: ContactProps): Contact {
    return new Contact(props.name, props.email, props.message);
  }

  static reconstitute(props: ContactProps): Contact {
    return new Contact(props.name, props.email, props.message);
  }
}
