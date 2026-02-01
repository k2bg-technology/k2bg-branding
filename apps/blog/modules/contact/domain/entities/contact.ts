import type { ContactPrimitives, ContactProps } from '../types';
import { Email, Message, Name } from '../value-objects';

/**
 * Contact Entity
 *
 * Represents a contact form submission with visitor information.
 */
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

  toPrimitives(): ContactPrimitives {
    return {
      name: this._name.getValue(),
      email: this._email.getValue(),
      message: this._message.getValue(),
    };
  }

  static create(input: ContactPrimitives): Contact {
    return new Contact(
      Name.create(input.name),
      Email.create(input.email),
      Message.create(input.message)
    );
  }

  static reconstitute(props: ContactProps): Contact {
    return new Contact(props.name, props.email, props.message);
  }
}
