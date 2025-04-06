'use server';

import * as SendGrid from '../../modules/data-access/send-grid';
import {
  Contact,
  contactSchema,
} from '../../modules/interfaces/contact/validator';
import { SendEmail } from '../../modules/use-cases/contact';

export async function contactFormAction(data: Contact) {
  const validatedFields = contactSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error(
      JSON.stringify(validatedFields.error.flatten().fieldErrors)
    );
  }

  await new SendEmail(new SendGrid.Adapter()).execute(validatedFields.data);

  return null;
}
