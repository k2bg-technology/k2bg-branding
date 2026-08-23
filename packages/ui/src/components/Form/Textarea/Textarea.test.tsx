import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type ControlProps = React.ComponentProps<typeof Form.Control>;
type TextareaProps = React.ComponentProps<typeof Form.Textarea>;
type HelperTextProps = React.ComponentProps<typeof Form.HelperText>;

const labelText = 'Message';
const helperTextContent = 'Up to 500 characters';

function renderInControl({
  controlProps = {},
  textareaProps = {},
  helperTextProps = {},
}: {
  controlProps?: ControlProps;
  textareaProps?: TextareaProps;
  helperTextProps?: HelperTextProps;
} = {}) {
  return render(
    <Form.Control {...controlProps}>
      <Form.Label htmlFor="message">{labelText}</Form.Label>
      <Form.Textarea id="message" {...textareaProps} />
      <Form.HelperText {...helperTextProps}>
        {helperTextContent}
      </Form.HelperText>
    </Form.Control>
  );
}

function getTextarea() {
  return screen.getByRole('textbox', { name: labelText });
}

function getHelperText() {
  return screen.getByText(helperTextContent);
}

const explicitAriaInvalidCases: ReadonlyArray<{
  explicitAriaInvalid: React.AriaAttributes['aria-invalid'];
  expected: string;
}> = [
  { explicitAriaInvalid: 'grammar', expected: 'grammar' },
  { explicitAriaInvalid: false, expected: 'false' },
];

describe('Textarea', () => {
  it('marks the textarea as invalid when the control has an error', () => {
    renderInControl({ controlProps: { error: true } });

    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
  });

  it('describes the textarea with the helper text when the control has an error', () => {
    renderInControl({ controlProps: { error: true } });

    const describedBy = getTextarea().getAttribute('aria-describedby');
    expect(describedBy).toBe(getHelperText().id);
    expect(document.getElementById(describedBy ?? '')).toBe(getHelperText());
  });

  it('leaves the textarea unmarked and undescribed without an error', () => {
    renderInControl();

    expect(getTextarea()).not.toHaveAttribute('aria-invalid');
    expect(getTextarea()).not.toHaveAttribute('aria-describedby');
  });

  it('keeps a consumer-provided aria-describedby before the helper text id', () => {
    const extraDescriptionId = 'extra';

    renderInControl({
      controlProps: { error: true },
      textareaProps: { 'aria-describedby': extraDescriptionId },
    });

    expect(getTextarea()).toHaveAttribute(
      'aria-describedby',
      `${extraDescriptionId} ${getHelperText().id}`
    );
  });

  it.each(explicitAriaInvalidCases)(
    'keeps the consumer-provided aria-invalid "$expected" over the error state',
    ({ explicitAriaInvalid, expected }) => {
      renderInControl({
        controlProps: { error: true },
        textareaProps: { 'aria-invalid': explicitAriaInvalid },
      });

      expect(getTextarea()).toHaveAttribute('aria-invalid', expected);
    }
  );

  it('describes the textarea with an explicitly identified helper text', () => {
    const customHelperTextId = 'custom-helper';

    renderInControl({
      controlProps: { error: true },
      helperTextProps: { id: customHelperTextId },
    });

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getTextarea()).toHaveAttribute(
      'aria-describedby',
      customHelperTextId
    );
  });

  it('disables the textarea when the control is disabled', () => {
    renderInControl({ controlProps: { disabled: true } });

    expect(getTextarea()).toBeDisabled();
  });
});
