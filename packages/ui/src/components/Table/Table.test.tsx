import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Table } from '.';

const invoiceTable = (
  <Table className="table-class">
    <Table.Caption className="caption-class">Recent invoices</Table.Caption>
    <Table.Header className="header-class">
      <Table.Row className="row-class">
        <Table.Head className="head-class">Invoice</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body className="body-class">
      <Table.Row>
        <Table.Cell className="cell-class">INV001</Table.Cell>
      </Table.Row>
    </Table.Body>
    <Table.Footer className="footer-class">
      <Table.Row>
        <Table.Cell>Total</Table.Cell>
      </Table.Row>
    </Table.Footer>
  </Table>
);

describe('Table', () => {
  it('names the table with its caption', () => {
    const caption = 'Recent invoices';

    render(
      <Table>
        <Table.Caption>{caption}</Table.Caption>
        <Table.Body>
          <Table.Row>
            <Table.Cell>INV001</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByRole('table', { name: caption })).toBeInTheDocument();
  });

  it('keeps the caption as the accessible name when it is visually hidden', () => {
    const caption = 'Recent invoices';

    render(
      <Table>
        <Table.Caption className="sr-only">{caption}</Table.Caption>
        <Table.Body>
          <Table.Row>
            <Table.Cell>INV001</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByRole('table', { name: caption })).toBeInTheDocument();
  });

  it('renders the header, body, and footer as row groups', () => {
    render(invoiceTable);

    const expectedRowGroupCount = 3;
    expect(screen.getAllByRole('rowgroup')).toHaveLength(expectedRowGroupCount);
  });

  it.each`
    part      | role
    ${'Row'}  | ${'row'}
    ${'Head'} | ${'columnheader'}
    ${'Cell'} | ${'cell'}
  `('renders Table.$part with the $role role', ({ role }) => {
    render(invoiceTable);

    expect(screen.getAllByRole(role).length).toBeGreaterThan(0);
  });

  it.each`
    slot               | className
    ${'table'}         | ${'table-class'}
    ${'table-caption'} | ${'caption-class'}
    ${'table-header'}  | ${'header-class'}
    ${'table-row'}     | ${'row-class'}
    ${'table-head'}    | ${'head-class'}
    ${'table-body'}    | ${'body-class'}
    ${'table-cell'}    | ${'cell-class'}
    ${'table-footer'}  | ${'footer-class'}
  `('merges a custom class name into the $slot part', ({ slot, className }) => {
    const { container } = render(invoiceTable);

    expect(container.querySelector(`[data-slot="${slot}"]`)).toHaveClass(
      className
    );
  });

  it('lets a right alignment class replace the default left alignment', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="text-right">Amount</Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>
    );

    const amountHeader = screen.getByRole('columnheader', { name: 'Amount' });
    expect(amountHeader).toHaveClass('text-right');
    expect(amountHeader).not.toHaveClass('text-left');
  });

  it('forwards row state and cell span attributes', () => {
    const columnSpan = 3;

    render(
      <Table>
        <Table.Body>
          <Table.Row data-state="selected">
            <Table.Cell colSpan={columnSpan}>Total</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByRole('row')).toHaveAttribute('data-state', 'selected');
    expect(screen.getByRole('cell', { name: 'Total' })).toHaveAttribute(
      'colspan',
      String(columnSpan)
    );
  });
});
