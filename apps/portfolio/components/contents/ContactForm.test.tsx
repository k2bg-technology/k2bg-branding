import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../i18n/locales/en/translation.json';

import { ContactForm } from './ContactForm';

const dictionary = en.contact.form;
const actionUrl = 'https://formspree.example/f/contact';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function createFetchResponse(ok: boolean): Response {
  // Only `ok` is read by the submission handler.
  return { ok } as Response;
}

async function fillAndSubmitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(dictionary.nameLabel), 'John Smith');
  await user.type(
    screen.getByLabelText(dictionary.emailLabel),
    'john@example.com'
  );
  await user.type(
    screen.getByLabelText(dictionary.messageLabel),
    'Hello from the contact form.'
  );
  await user.click(screen.getByRole('button', { name: dictionary.submit }));
}

describe('ContactForm', () => {
  it('shows the success message when the submission succeeds', async () => {
    stubFetch(() => Promise.resolve(createFetchResponse(true)));
    const user = userEvent.setup();
    render(<ContactForm dictionary={dictionary} actionUrl={actionUrl} />);

    await fillAndSubmitForm(user);

    expect(
      await screen.findByText(dictionary.successMessage)
    ).toBeInTheDocument();
  });

  it('clears the form fields when the submission succeeds', async () => {
    stubFetch(() => Promise.resolve(createFetchResponse(true)));
    const user = userEvent.setup();
    render(<ContactForm dictionary={dictionary} actionUrl={actionUrl} />);

    await fillAndSubmitForm(user);

    await screen.findByText(dictionary.successMessage);
    expect(screen.getByLabelText(dictionary.nameLabel)).toHaveValue('');
    expect(screen.getByLabelText(dictionary.emailLabel)).toHaveValue('');
    expect(screen.getByLabelText(dictionary.messageLabel)).toHaveValue('');
  });

  it('shows the error message when the server responds with a non-OK status', async () => {
    stubFetch(() => Promise.resolve(createFetchResponse(false)));
    const user = userEvent.setup();
    render(<ContactForm dictionary={dictionary} actionUrl={actionUrl} />);

    await fillAndSubmitForm(user);

    expect(
      await screen.findByText(dictionary.errorMessage)
    ).toBeInTheDocument();
  });

  it('shows the error message when the request throws', async () => {
    stubFetch(() => Promise.reject(new Error('Network error')));
    const user = userEvent.setup();
    render(<ContactForm dictionary={dictionary} actionUrl={actionUrl} />);

    await fillAndSubmitForm(user);

    expect(
      await screen.findByText(dictionary.errorMessage)
    ).toBeInTheDocument();
  });

  it('shows the error message without sending a request when no action URL is configured', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve(createFetchResponse(true))
    );
    const user = userEvent.setup();
    render(<ContactForm dictionary={dictionary} />);

    await fillAndSubmitForm(user);

    expect(
      await screen.findByText(dictionary.errorMessage)
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('disables the form controls while the submission is in flight', async () => {
    stubFetch(
      () =>
        new Promise<Response>(() => {
          // Never settles so the form stays in the submitting state.
        })
    );
    const user = userEvent.setup();
    render(<ContactForm dictionary={dictionary} actionUrl={actionUrl} />);

    await fillAndSubmitForm(user);

    expect(
      screen.getByRole('button', { name: dictionary.submitting })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: dictionary.reset })
    ).toBeDisabled();
    expect(screen.getByLabelText(dictionary.nameLabel)).toBeDisabled();
    expect(screen.getByLabelText(dictionary.emailLabel)).toBeDisabled();
    expect(screen.getByLabelText(dictionary.messageLabel)).toBeDisabled();
  });
});
