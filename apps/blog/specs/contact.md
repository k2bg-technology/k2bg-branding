# Contact Spec

## Purpose

The Contact module represents contact form submissions. It sends a confirmation email to the submitter and delivers a copy of every submission to the operator (via Bcc on the sender address).

## Problem & Outcome

- **User:** Readers who want to reach k2bg; the operator who must receive those inquiries.
- **Problem:** A reader needs reassurance their message was received; the operator needs to actually receive every submission.
- **Desired outcome:** The submitter gets a confirmation email and the operator receives a copy of each submission.
- **Success signal:** Confirmation email deliverability; the operator receives the Bcc for every submission.
- **Non-goals:** Inbox / CRM storage and spam scoring. (Operator notification is **not** out of scope — it is delivered via Bcc; see Rules.)

## Scope

In scope:

- Submitter name, email, and message validation.
- Contact entity creation.
- Confirmation email generation.
- Email sending through an output port.

Out of scope:

- Inbox / CRM storage.
- Spam scoring.
- A dedicated admin notification workflow beyond the Bcc copy (e.g. routing to a ticketing system).

## Terms

| Term         | Definition                                       | Code identifier |
| ------------ | ------------------------------------------------ | --------------- |
| Contact      | Contact-form submission with visitor information | `Contact`       |
| Name         | Submitter's name                                 | `Name`          |
| Email        | Submitter's email address                        | `Email`         |
| Message      | Contact message body                             | `Message`       |
| Email Sender | Output port for email delivery                   | `EmailSender`   |

## Rules

- A contact submission requires a valid name, email, and message.
- Email format validation belongs to the `Email` value object.
- The confirmation email is generated from the contact mail template.
- The confirmation email is sent to the submitter (`To`); the operator (the sender address) is `Bcc`'d on every submission, so the operator receives every inquiry. See `AwsSesEmailSender`.
- Email delivery failures are surfaced as domain/use-case errors, not swallowed.

## Use Cases

### UC1 - Send confirmation email

Given a visitor submits valid contact form input  
When the contact email use case runs  
Then a `Contact` is created and a confirmation email is sent.

Given the name is invalid  
When the contact email use case runs  
Then `InvalidNameError` is returned.

Given the email is invalid  
When the contact email use case runs  
Then `InvalidEmailError` is returned.

Given the message is invalid  
When the contact email use case runs  
Then `InvalidMessageError` is returned.

Given the email provider fails  
When the contact email use case runs  
Then `EmailSendFailedError` or the adapter error is returned.

## Contracts

| Operation   | Boundary | Request              | Response / Result | Errors                                                                                 |
| ----------- | -------- | -------------------- | ----------------- | -------------------------------------------------------------------------------------- |
| `SendEmail` | use case | name, email, message | void on success   | `InvalidNameError`, `InvalidEmailError`, `InvalidMessageError`, `EmailSendFailedError` |

Permission:

- Public visitors may submit the contact form.

## Test Expectations

- Domain-unit tests cover name, email, message, and primitive conversion behavior.
- Acceptance tests cover successful confirmation email and validation failures.
- Adapter tests cover AWS SES email sender behavior and failure mapping.
