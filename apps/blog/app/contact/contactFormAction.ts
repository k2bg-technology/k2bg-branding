'use server';

import { verify } from 'hcaptcha';

import * as SendGrid from '../../modules/data-access/send-grid';
import {
  Contact,
  contactSchema,
} from '../../modules/interfaces/contact/validator';
import { SendEmail } from '../../modules/use-cases/contact';

export async function contactFormAction(
  data: Contact & {
    token: string;
  }
) {
  const { token, ...visitor } = data;

  const validatedFields = contactSchema.safeParse(visitor);

  if (!validatedFields.success) {
    throw new Error(
      JSON.stringify(validatedFields.error.flatten().fieldErrors)
    );
  }

  const verifyResponse = await verify(
    process.env.H_CAPTCHA_SECRET || '',
    token
  );

  if (!verifyResponse.success) {
    throw new Error('captcha verification failed');
  }

  await new SendEmail(new SendGrid.Adapter()).execute(validatedFields.data);

  return null;
}
