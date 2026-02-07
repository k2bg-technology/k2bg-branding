'use server';

import { verify } from 'hcaptcha';

import { createSendEmailUseCase } from '../../infrastructure/di';
import { contactLogger } from '../../modules/contact/adapters/shared';
import { type Contact, contactSchema } from './contactSchema';

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
    contactLogger.error(
      { action: 'contactFormAction' },
      'hCaptcha verification failed'
    );
    throw new Error('captcha verification failed');
  }

  try {
    const sendEmail = createSendEmailUseCase();
    await sendEmail.execute(validatedFields.data);
    contactLogger.info(
      { action: 'contactFormAction' },
      'Contact email sent successfully'
    );
  } catch (err) {
    contactLogger.error(
      { err, action: 'contactFormAction' },
      'Failed to send contact email'
    );
    throw err;
  }

  return null;
}
