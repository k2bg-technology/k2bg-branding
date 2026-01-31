'use server';

import { verify } from 'hcaptcha';

import { createSendEmailUseCase } from '../../infrastructure/di';
import {
  type Contact,
  contactSchema,
} from '../../modules/interfaces/contact/validator';

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

  await createSendEmailUseCase().execute(validatedFields.data);

  return null;
}
