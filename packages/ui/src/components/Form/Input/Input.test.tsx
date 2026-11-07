import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type FieldProps = React.ComponentProps<typeof Form.Field>;
type InputProps = React.ComponentProps<typeof Form.Input>;
type HelperTextProps = React.ComponentProps<typeof Form.HelperText>;

const labelText = 'Email';
const helperTextContent = 'Enter a valid email address';

function renderInField({
  fieldProps = {},
  inputProps = {},
  helperTextProps = {},
}: {
  fieldProps?: FieldProps;
  inputProps?: InputProps;
  helperTextProps?: HelperTextProps;
} = {}) {
  return render(
    <Form.Field {...fieldProps}>
      <Form.Label htmlFor="email">{labelText}</Form.Label>
      <Form.Input id="email" {...inputProps} />
      <Form.HelperText {...helperTextProps}>
        {helperTextContent}
      </Form.HelperText>
    </Form.Field>
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
    renderInField({ fieldProps: { error: true } });

    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('describes the input with the helper text when the control has an error', () => {
    renderInField({ fieldProps: { error: true } });

    const describedBy = getInput().getAttribute('aria-describedby');
    expect(describedBy).toBe(getHelperText().id);
    expect(document.getElementById(describedBy ?? '')).toBe(getHelperText());
  });

  it('leaves the input unmarked and undescribed without an error', () => {
    renderInField();

    expect(getInput()).not.toHaveAttribute('aria-invalid');
    expect(getInput()).not.toHaveAttribute('aria-describedby');
  });

  it('keeps a consumer-provided aria-describedby before the helper text id', () => {
    const extraDescriptionId = 'extra';

    renderInField({
      fieldProps: { error: true },
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
      renderInField({
        fieldProps: { error: true },
        inputProps: { 'aria-invalid': explicitAriaInvalid },
      });

      expect(getInput()).toHaveAttribute('aria-invalid', expected);
    }
  );

  it('describes the input with the helper text id given to the control', () => {
    const customHelperTextId = 'custom-helper';

    renderInField({
      fieldProps: { error: true, helperTextId: customHelperTextId },
    });

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', customHelperTextId);
  });

  it('keeps describing the input with the control id when a helper text id is forced onto it', () => {
    const strayHelperTextId = 'stray-helper';
    // `helperTextId` is not part of the Input props; the cast mirrors a
    // consumer smuggling it through an untyped spread.
    const strayProps = { helperTextId: strayHelperTextId } as InputProps;

    renderInField({ fieldProps: { error: true }, inputProps: strayProps });

    expect(getInput()).toHaveAttribute('aria-describedby', getHelperText().id);
    expect(getInput()).not.toHaveAttribute(
      'aria-describedby',
      strayHelperTextId
    );
  });

  it('rejects a helper text id at the type level', () => {
    // @ts-expect-error -- only Form.Field can keep both sides in sync.
    const element = <Form.Input helperTextId="custom-helper" />;

    expect(element).toBeDefined();
  });

  it('disables the input when the control is disabled', () => {
    renderInField({ fieldProps: { disabled: true } });

    expect(getInput()).toBeDisabled();
  });
});
