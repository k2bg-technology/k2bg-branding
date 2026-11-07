import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type FieldProps = React.ComponentProps<typeof Form.Field>;
type TextareaProps = React.ComponentProps<typeof Form.Textarea>;
type HelperTextProps = React.ComponentProps<typeof Form.HelperText>;

const labelText = 'Message';
const helperTextContent = 'Up to 500 characters';

function renderInField({
  fieldProps = {},
  textareaProps = {},
  helperTextProps = {},
}: {
  fieldProps?: FieldProps;
  textareaProps?: TextareaProps;
  helperTextProps?: HelperTextProps;
} = {}) {
  return render(
    <Form.Field {...fieldProps}>
      <Form.Label htmlFor="message">{labelText}</Form.Label>
      <Form.Textarea id="message" {...textareaProps} />
      <Form.HelperText {...helperTextProps}>
        {helperTextContent}
      </Form.HelperText>
    </Form.Field>
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
    renderInField({ fieldProps: { error: true } });

    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
  });

  it('describes the textarea with the helper text when the control has an error', () => {
    renderInField({ fieldProps: { error: true } });

    const describedBy = getTextarea().getAttribute('aria-describedby');
    expect(describedBy).toBe(getHelperText().id);
    expect(document.getElementById(describedBy ?? '')).toBe(getHelperText());
  });

  it('leaves the textarea unmarked and undescribed without an error', () => {
    renderInField();

    expect(getTextarea()).not.toHaveAttribute('aria-invalid');
    expect(getTextarea()).not.toHaveAttribute('aria-describedby');
  });

  it('keeps a consumer-provided aria-describedby before the helper text id', () => {
    const extraDescriptionId = 'extra';

    renderInField({
      fieldProps: { error: true },
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
      renderInField({
        fieldProps: { error: true },
        textareaProps: { 'aria-invalid': explicitAriaInvalid },
      });

      expect(getTextarea()).toHaveAttribute('aria-invalid', expected);
    }
  );

  it('describes the textarea with the helper text id given to the control', () => {
    const customHelperTextId = 'custom-helper';

    renderInField({
      fieldProps: { error: true, helperTextId: customHelperTextId },
    });

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getTextarea()).toHaveAttribute(
      'aria-describedby',
      customHelperTextId
    );
  });

  it('keeps describing the textarea with the control id when a helper text id is forced onto it', () => {
    const strayHelperTextId = 'stray-helper';
    // `helperTextId` is not part of the Textarea props; the cast mirrors a
    // consumer smuggling it through an untyped spread.
    const strayProps = { helperTextId: strayHelperTextId } as TextareaProps;

    renderInField({
      fieldProps: { error: true },
      textareaProps: strayProps,
    });

    expect(getTextarea()).toHaveAttribute(
      'aria-describedby',
      getHelperText().id
    );
    expect(getTextarea()).not.toHaveAttribute(
      'aria-describedby',
      strayHelperTextId
    );
  });

  it('rejects a helper text id at the type level', () => {
    // @ts-expect-error -- only Form.Field can keep both sides in sync.
    const element = <Form.Textarea helperTextId="custom-helper" />;

    expect(element).toBeDefined();
  });

  it('disables the textarea when the control is disabled', () => {
    renderInField({ fieldProps: { disabled: true } });

    expect(getTextarea()).toBeDisabled();
  });
});
