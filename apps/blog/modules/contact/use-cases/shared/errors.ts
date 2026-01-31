export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SendEmailError extends UseCaseError {
  constructor(message: string) {
    super(`Failed to send email: ${message}`);
  }
}
