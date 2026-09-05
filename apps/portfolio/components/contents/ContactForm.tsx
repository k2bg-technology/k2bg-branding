'use client';

import { type FormEvent, useRef, useState } from 'react';
import { Button, Form } from 'ui';
import type { Dictionary } from '../../i18n/types';

type ContactFormDictionary = Dictionary['contact']['form'];
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
  dictionary: ContactFormDictionary;
  actionUrl?: string;
}

export function ContactForm({ dictionary, actionUrl }: Props) {
  const formReference = useRef<HTMLFormElement>(null);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>('idle');

  const isSubmitting = submissionStatus === 'submitting';
  const statusMessage = getStatusMessage(submissionStatus, dictionary);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!actionUrl) {
      setSubmissionStatus('error');
      return;
    }

    setSubmissionStatus('submitting');

    try {
      const response = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: new FormData(event.currentTarget),
      });

      if (!response.ok) {
        setSubmissionStatus('error');
        return;
      }

      formReference.current?.reset();
      setSubmissionStatus('success');
    } catch {
      setSubmissionStatus('error');
    }
  }

  return (
    <form
      ref={formReference}
      method="post"
      action={actionUrl}
      className="flex flex-col justify-center gap-spacious h-full"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-spacious md:flex-row">
        <Form.Control color="light" disabled={isSubmitting}>
          <div className="flex flex-col gap-normal w-full">
            <Form.Label htmlFor="name" data-gtm="contact_click_name_label">
              {dictionary.nameLabel}
            </Form.Label>
            <Form.Input
              type="text"
              name="name"
              id="name"
              placeholder={dictionary.namePlaceholder}
              required
              data-gtm="contact_focus_name_field"
            />
          </div>
        </Form.Control>
        <Form.Control color="light" disabled={isSubmitting}>
          <div className="flex flex-col gap-normal w-full">
            <Form.Label htmlFor="email" data-gtm="contact_click_email_label">
              {dictionary.emailLabel}
            </Form.Label>
            <Form.Input
              type="email"
              name="email"
              id="email"
              placeholder={dictionary.emailPlaceholder}
              required
              data-gtm="contact_focus_email_field"
            />
          </div>
        </Form.Control>
      </div>
      <Form.Control color="light" disabled={isSubmitting}>
        <div className="flex flex-col gap-normal w-full">
          <Form.Label htmlFor="message" data-gtm="contact_click_message_label">
            {dictionary.messageLabel}
          </Form.Label>
          <Form.Textarea
            name="message"
            id="message"
            rows={4}
            placeholder={dictionary.messagePlaceholder}
            required
            className="min-h-[4lh] max-h-[15lh]"
            data-gtm="contact_focus_message_field"
          />
        </div>
      </Form.Control>
      {/* biome-ignore lint/a11y/useSemanticElements: role=status is required for the contact submission live region. */}
      <div
        role="status"
        aria-live="polite"
        className="min-h-[1.5rem] text-body-r-sm leading-body-r-sm text-white"
      >
        {statusMessage}
      </div>
      <ul className="flex gap-spacious">
        <li>
          <Button
            type="submit"
            color="light"
            variant="outline"
            disabled={isSubmitting}
            data-gtm="contact_submit_form"
          >
            {isSubmitting ? dictionary.submitting : dictionary.submit}
          </Button>
        </li>
        <li>
          <Button
            type="reset"
            color="light"
            variant="outline"
            disabled={isSubmitting}
            data-gtm="contact_reset_form"
          >
            {dictionary.reset}
          </Button>
        </li>
      </ul>
    </form>
  );
}

function getStatusMessage(
  submissionStatus: SubmissionStatus,
  dictionary: ContactFormDictionary
) {
  if (submissionStatus === 'success') {
    return dictionary.successMessage;
  }

  if (submissionStatus === 'error') {
    return dictionary.errorMessage;
  }

  return '';
}
