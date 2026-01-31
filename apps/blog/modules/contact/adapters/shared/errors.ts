export class AdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EmailSendError extends AdapterError {
  constructor(message: string) {
    super(`Failed to send email: ${message}`);
  }
}
