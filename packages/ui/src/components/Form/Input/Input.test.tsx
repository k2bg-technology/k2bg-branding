import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type ControlProps = React.ComponentProps<typeof Form.Control>;
type InputProps = React.ComponentProps<typeof Form.Input>;
type HelperTextProps = React.ComponentProps<typeof Form.HelperText>;

const labelText = 'Email';
const helperTextContent = 'Enter a valid email address';

function renderInControl({
  controlProps = {},
  inputProps = {},
  helperTextProps = {},
}: {
  controlProps?: ControlProps;
  inputProps?: InputProps;
  helperTextProps?: HelperTextProps;
} = {}) {
  return render(
    <Form.Control {...controlProps}>
      <Form.Label htmlFor="email">{labelText}</Form.Label>
      <Form.Input id="email" {...inputProps} />
      <Form.HelperText {...helperTextProps}>
        {helperTextContent}
      </Form.HelperText>
    </Form.Control>
  );
}

function getInput() {
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

describe('Input', () => {
  it('marks the input as invalid when the control has an error', () => {
    renderInControl({ controlProps: { error: true } });

    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('describes the input with the helper text when the control has an error', () => {
    renderInControl({ controlProps: { error: true } });

    const describedBy = getInput().getAttribute('aria-describedby');
    expect(describedBy).toBe(getHelperText().id);
    expect(document.getElementById(describedBy ?? '')).toBe(getHelperText());
  });

  it('leaves the input unmarked and undescribed without an error', () => {
    renderInControl();

    expect(getInput()).not.toHaveAttribute('aria-invalid');
    expect(getInput()).not.toHaveAttribute('aria-describedby');
  });

  it('keeps a consumer-provided aria-describedby before the helper text id', () => {
    const extraDescriptionId = 'extra';

    renderInControl({
      controlProps: { error: true },
      inputProps: { 'aria-describedby': extraDescriptionId },
    });

    expect(getInput()).toHaveAttribute(
      'aria-describedby',
      `${extraDescriptionId} ${getHelperText().id}`
    );
  });

  it.each(explicitAriaInvalidCases)(
    'keeps the consumer-provided aria-invalid "$expected" over the error state',
    ({ explicitAriaInvalid, expected }) => {
      renderInControl({
        controlProps: { error: true },
        inputProps: { 'aria-invalid': explicitAriaInvalid },
      });

      expect(getInput()).toHaveAttribute('aria-invalid', expected);
    }
  );

  it('describes the input with the helper text id given to the control', () => {
    const customHelperTextId = 'custom-helper';

    renderInControl({
      controlProps: { error: true, helperTextId: customHelperTextId },
    });

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', customHelperTextId);
  });

  it('disables the input when the control is disabled', () => {
    renderInControl({ controlProps: { disabled: true } });

    expect(getInput()).toBeDisabled();
  });
});
