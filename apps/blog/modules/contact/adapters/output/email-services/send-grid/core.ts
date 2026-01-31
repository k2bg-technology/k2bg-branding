import sgMail, { type MailService, ResponseError } from '@sendgrid/mail';

export class SendGridCore {
  private sgMail: MailService;

  constructor() {
    this.sgMail = sgMail;
    this.sgMail.setApiKey(process.env.SEND_GRID_API_KEY ?? '');
  }

  protected async send(...props: Parameters<MailService['send']>) {
    try {
      return this.sgMail.send(...props);
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new Error(error.response.body);
      } else {
        throw new Error('Unknown error occurred while sending email');
      }
    }
  }
}
