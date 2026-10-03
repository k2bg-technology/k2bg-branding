import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table } from '.';

const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit card', amount: '¥25,000' },
  {
    id: 'INV002',
    status: 'Pending',
    method: 'Bank transfer',
    amount: '¥15,000',
  },
  {
    id: 'INV003',
    status: 'Unpaid',
    method: 'Bank transfer',
    amount: '¥35,000',
  },
  { id: 'INV004', status: 'Paid', method: 'Credit card', amount: '¥45,000' },
  { id: 'INV005', status: 'Paid', method: 'Direct debit', amount: '¥55,000' },
];

const invoiceHeader = (
  <Table.Header>
    <Table.Row>
      <Table.Head scope="col" className="w-28">
        Invoice
      </Table.Head>
      <Table.Head scope="col">Status</Table.Head>
      <Table.Head scope="col">Method</Table.Head>
      <Table.Head scope="col" className="text-right">
        Amount
      </Table.Head>
    </Table.Row>
  </Table.Header>
);

const invoiceFooter = (
  <Table.Footer>
    <Table.Row>
      <Table.Cell colSpan={3}>Total</Table.Cell>
      <Table.Cell className="text-right tabular-nums">¥175,000</Table.Cell>
    </Table.Row>
  </Table.Footer>
);

const meta = {
  component: Table,
  argTypes: {
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.table.description',
      },
      overview: 'components.table.overview',
      usage: 'components.table.usage',
      accessibility: 'components.table.accessibility',
      doList: 'components.table.doList',
      dontList: 'components.table.dontList',
      relatedComponents: 'components.table.relatedComponents',
      dependencies: 'components.table.dependencies',
      references: 'components.table.references',
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Table.Caption>A list of recent invoices</Table.Caption>
        {invoiceHeader}
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
              <Table.Cell>{invoice.status}</Table.Cell>
              <Table.Cell>{invoice.method}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {invoice.amount}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        {invoiceFooter}
      </>
    ),
  },
};

export const SelectedRow: Story = {
  args: {
    children: (
      <>
        <Table.Caption>Invoices with the second row selected</Table.Caption>
        {invoiceHeader}
        <Table.Body>
          {invoices.map((invoice, index) => (
            <Table.Row
              key={invoice.id}
              data-state={index === 1 ? 'selected' : undefined}
            >
              <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
              <Table.Cell>{invoice.status}</Table.Cell>
              <Table.Cell>{invoice.method}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {invoice.amount}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </>
    ),
  },
};

export const WithoutCaption: Story = {
  args: {
    'aria-label': 'Recent invoices',
    children: (
      <>
        {invoiceHeader}
        <Table.Body>
          {invoices.slice(0, 3).map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
              <Table.Cell>{invoice.status}</Table.Cell>
              <Table.Cell>{invoice.method}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {invoice.amount}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </>
    ),
  },
};

export const Bordered: Story = {
  args: {
    children: (
      <>
        <Table.Caption className="px-2 pb-spacious text-left">
          Invoices inside a bordered frame
        </Table.Caption>
        {invoiceHeader}
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
              <Table.Cell>{invoice.status}</Table.Cell>
              <Table.Cell>{invoice.method}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {invoice.amount}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="overflow-hidden rounded-lg border border-base-default/20">
        <Story />
      </div>
    ),
  ],
};
