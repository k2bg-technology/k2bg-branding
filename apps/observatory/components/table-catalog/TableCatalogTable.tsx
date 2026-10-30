import { Card, ScrollArea, Table } from 'ui';

import type { TableSummaryOutput } from '../../modules/catalog/use-cases';

interface Props {
  tables: TableSummaryOutput[];
}

const integerFormat = new Intl.NumberFormat('en-US');

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const { value, unitIndex } = Array.from({ length: units.length - 1 }).reduce<{
    value: number;
    unitIndex: number;
  }>(
    (result) =>
      result.value >= 1024
        ? { value: result.value / 1024, unitIndex: result.unitIndex + 1 }
        : result,
    { value: bytes, unitIndex: 0 }
  );
  const digits = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function TableCatalogTable({ tables }: Props) {
  if (tables.length === 0) {
    return (
      <p className="text-body-r-md">
        No tables to show. The catalog lists the datasets that dashboard
        definitions reference.
      </p>
    );
  }

  return (
    <Card>
      <Card.Content>
        {/* Table's wrapper stays open so ScrollArea owns horizontal scrolling. */}
        <ScrollArea
          className="[&_[data-slot=table-container]]:overflow-visible"
          scrollbar={<ScrollArea.ScrollBar orientation="horizontal" />}
        >
          <Table className="border-collapse border-b border-base-default/15 whitespace-nowrap">
            <Table.Header className="text-base-black/80">
              <Table.Row className="border-base-default/15 text-left hover:bg-transparent">
                <Table.Head
                  scope="col"
                  className="h-auto py-condensed pr-normal pl-0"
                >
                  Dataset
                </Table.Head>
                <Table.Head
                  scope="col"
                  className="h-auto py-condensed pr-normal pl-0"
                >
                  Table
                </Table.Head>
                <Table.Head
                  scope="col"
                  className="h-auto py-condensed pr-normal pl-0"
                >
                  Type
                </Table.Head>
                <Table.Head
                  scope="col"
                  className="h-auto py-condensed pr-normal pl-0 text-right"
                >
                  Rows
                </Table.Head>
                <Table.Head
                  scope="col"
                  className="h-auto py-condensed pr-normal pl-0 text-right"
                >
                  Size
                </Table.Head>
                <Table.Head scope="col" className="h-auto px-0 py-condensed">
                  Last modified
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tables.map((table) => (
                <Table.Row
                  key={`${table.datasetId}.${table.name}`}
                  className="border-base-default/15 hover:bg-transparent"
                >
                  <Table.Cell className="py-condensed pr-normal pl-0">
                    {table.datasetId}
                  </Table.Cell>
                  <Table.Head
                    scope="row"
                    className="h-auto py-condensed pr-normal pl-0 text-left font-normal"
                  >
                    {table.name}
                  </Table.Head>
                  <Table.Cell className="py-condensed pr-normal pl-0">
                    {table.type}
                  </Table.Cell>
                  <Table.Cell className="py-condensed pr-normal pl-0 text-right tabular-nums">
                    {table.rowCount === null
                      ? '—'
                      : integerFormat.format(table.rowCount)}
                  </Table.Cell>
                  <Table.Cell className="py-condensed pr-normal pl-0 text-right tabular-nums">
                    {table.sizeInBytes === null
                      ? '—'
                      : formatBytes(table.sizeInBytes)}
                  </Table.Cell>
                  <Table.Cell className="px-0 py-condensed tabular-nums">
                    {table.lastModifiedAt === null ? (
                      '—'
                    ) : (
                      <time dateTime={table.lastModifiedAt}>
                        {table.lastModifiedAt.slice(0, 10)}
                      </time>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ScrollArea>
      </Card.Content>
    </Card>
  );
}
