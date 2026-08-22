export {
  AwsSesEmailSender,
  generateHtmlTemplate,
  HandlebarsEmailTemplateRenderer,
} from './adapters';
export type {
  ContactPrimitives,
  EmailSender,
  EmailTemplateRenderer,
} from './domain';
export { Contact } from './domain';
export { SendEmail, type SendEmailInput } from './use-cases';
