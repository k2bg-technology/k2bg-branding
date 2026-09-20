import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeriodSelector } from '.';

function renderPeriodSelector(
  overrides: Partial<React.ComponentProps<typeof PeriodSelector>> = {}
) {
  const onPrevious = vi.fn();
  const onNext = vi.fn();

  render(
    <PeriodSelector
      label="August 2026"
      previousLabel="Previous month"
      nextLabel="Next month"
      onPrevious={onPrevious}
      onNext={onNext}
      {...overrides}
    />
  );

  return { onPrevious, onNext };
}

function RouterLink({ href, children, ...rest }: React.ComponentProps<'a'>) {
  return (
    <a data-router-link="" href={href} {...rest}>
      {children}
    </a>
  );
}

const previousPeriodHref = '/insights?period=2026-07';
const nextPeriodHref = '/insights?period=2026-09';

describe('PeriodSelector', () => {
  it('shows the current period label', () => {
    renderPeriodSelector();

    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  it('names the stepping buttons with the given labels', () => {
    renderPeriodSelector();

    expect(
      screen.getByRole('button', { name: 'Previous month' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Next month' })
    ).toBeInTheDocument();
  });

  it('calls onPrevious when the previous button is clicked', async () => {
    const user = userEvent.setup();
    const { onPrevious } = renderPeriodSelector();

    await user.click(screen.getByRole('button', { name: 'Previous month' }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when the next button is clicked', async () => {
    const user = userEvent.setup();
    const { onNext } = renderPeriodSelector();

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it.each`
    prop                  | buttonName
    ${'previousDisabled'} | ${'Previous month'}
    ${'nextDisabled'}     | ${'Next month'}
  `('disables the $buttonName button with $prop', ({ prop, buttonName }) => {
    renderPeriodSelector({ [prop]: true });

    expect(screen.getByRole('button', { name: buttonName })).toBeDisabled();
  });

  it('does not call the handler of a disabled button', async () => {
    const user = userEvent.setup();
    const { onNext } = renderPeriodSelector({ nextDisabled: true });

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onNext).not.toHaveBeenCalled();
  });

  it('announces label changes politely', () => {
    renderPeriodSelector();

    expect(screen.getByText('August 2026')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });

  it.each`
    hrefProp          | href                  | controlName
    ${'previousHref'} | ${previousPeriodHref} | ${'Previous month'}
    ${'nextHref'}     | ${nextPeriodHref}     | ${'Next month'}
  `(
    'renders the $controlName control as a link when $hrefProp is given',
    ({ hrefProp, href, controlName }) => {
      renderPeriodSelector({ [hrefProp]: href });

      expect(screen.getByRole('link', { name: controlName })).toHaveAttribute(
        'href',
        href
      );
    }
  );

  it('renders both controls as buttons when no href is given', () => {
    renderPeriodSelector();

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each`
    bound         | form          | overrides                                                       | controlName
    ${'earliest'} | ${'callback'} | ${{ previousDisabled: true }}                                   | ${'Previous month'}
    ${'earliest'} | ${'link'}     | ${{ previousDisabled: true, previousHref: previousPeriodHref }} | ${'Previous month'}
    ${'latest'}   | ${'callback'} | ${{ nextDisabled: true }}                                       | ${'Next month'}
    ${'latest'}   | ${'link'}     | ${{ nextDisabled: true, nextHref: nextPeriodHref }}             | ${'Next month'}
  `(
    'keeps the $controlName control a disabled button at the $bound period in the $form form',
    ({ overrides, controlName }) => {
      renderPeriodSelector(overrides);

      expect(screen.getByRole('button', { name: controlName })).toBeDisabled();
      expect(
        screen.queryByRole('link', { name: controlName })
      ).not.toBeInTheDocument();
    }
  );

  it('calls onPrevious when the previous link is activated', async () => {
    const user = userEvent.setup();
    const { onPrevious } = renderPeriodSelector({
      previousHref: '#period-2026-07',
    });

    await user.click(screen.getByRole('link', { name: 'Previous month' }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('reaches the previous link with the keyboard', async () => {
    const user = userEvent.setup();
    renderPeriodSelector({ previousHref: previousPeriodHref });

    await user.tab();

    expect(screen.getByRole('link', { name: 'Previous month' })).toHaveFocus();
  });

  it('passes the href to a custom link component', () => {
    renderPeriodSelector({
      previousHref: previousPeriodHref,
      linkComponent: RouterLink,
    });

    const previousLink = screen.getByRole('link', { name: 'Previous month' });
    expect(previousLink).toHaveAttribute('href', previousPeriodHref);
    expect(previousLink).toHaveAttribute('data-router-link');
  });

  it.each`
    hrefProp          | href                  | controlName
    ${'previousHref'} | ${previousPeriodHref} | ${'Previous month'}
    ${'nextHref'}     | ${nextPeriodHref}     | ${'Next month'}
  `(
    'keeps the $controlName control a disabled button while the whole selector is disabled',
    ({ hrefProp, href, controlName }) => {
      renderPeriodSelector({ disabled: true, [hrefProp]: href });

      expect(screen.getByRole('button', { name: controlName })).toBeDisabled();
      expect(
        screen.queryByRole('link', { name: controlName })
      ).not.toBeInTheDocument();
    }
  );

  it.each`
    controlName
    ${'Previous month'}
    ${'Next month'}
  `(
    'disables the $controlName control when it has neither a URL nor a handler',
    ({ controlName }) => {
      render(
        <PeriodSelector
          label="August 2026"
          previousLabel="Previous month"
          nextLabel="Next month"
        />
      );

      expect(screen.getByRole('button', { name: controlName })).toBeDisabled();
    }
  );
});
