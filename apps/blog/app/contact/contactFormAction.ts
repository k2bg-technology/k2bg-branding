'use server';

import { createHash } from 'node:crypto';

import { verify } from 'hcaptcha';
import { headers } from 'next/headers';

import {
  createEnforceContactRateLimitUseCase,
  createSendEmailUseCase,
} from '../../infrastructure/di';
import { contactLogger } from '../../modules/contact/adapters/shared';
import { ContactRateLimitExceededError } from '../../modules/contact/use-cases';
import { type Contact, contactSchema } from './contactSchema';

const UNKNOWN_CLIENT_IP = 'unknown';
const RATE_LIMIT_EXCEEDED_MESSAGE =
  '送信回数の上限に達しました。しばらくしてからお試しください。';

function hashClientIp(clientIp: string): string {
  return createHash('sha256').update(clientIp).digest('hex');
}

async function getClientIpHash(): Promise<string> {
  const forwardedFor = (await headers()).get('x-forwarded-for');
  const clientIp = forwardedFor?.split(',')[0]?.trim() || UNKNOWN_CLIENT_IP;

  return hashClientIp(clientIp);
}

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

  try {
    const enforceContactRateLimit = createEnforceContactRateLimitUseCase();
    await enforceContactRateLimit.execute({
      ipHash: await getClientIpHash(),
    });
  } catch (error) {
    if (error instanceof ContactRateLimitExceededError) {
      throw new Error(RATE_LIMIT_EXCEEDED_MESSAGE);
    }
    throw error;
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
