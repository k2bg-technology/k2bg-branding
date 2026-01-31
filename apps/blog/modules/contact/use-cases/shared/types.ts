export interface SendEmailInput {
  name: string;
  email: string;
  message: string;
}

export interface SendEmailOutput {
  success: boolean;
}
