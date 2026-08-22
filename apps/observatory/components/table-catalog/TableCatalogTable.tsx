import type { TableSummaryOutput } from '../../modules/catalog/use-cases';

interface Props {
  tables: TableSummaryOutput[];
}

const integerFormat = new Intl.NumberFormat('en-US');

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

function formatDate(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}

function tableKey(table: TableSummaryOutput): string {
  return `${table.datasetId}.${table.name}`;
}

export function TableCatalogTable({ tables }: Props) {
  if (tables.length === 0) {
    return <p className="text-body-r-md">The warehouse has no tables yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-body-r-sm">
      <thead>
        <tr className="border-b border-base-default text-left">
          <th scope="col" className="py-condensed pr-normal">
            Dataset
          </th>
          <th scope="col" className="py-condensed pr-normal">
            Table
          </th>
          <th scope="col" className="py-condensed pr-normal text-right">
            Rows
          </th>
          <th scope="col" className="py-condensed pr-normal text-right">
            Size
          </th>
          <th scope="col" className="py-condensed">
            Last modified
          </th>
        </tr>
      </thead>
      <tbody>
        {tables.map((table) => (
          <tr key={tableKey(table)} className="border-b border-base-light">
            <td className="py-condensed pr-normal">{table.datasetId}</td>
            <th
              scope="row"
              className="py-condensed pr-normal text-left font-normal"
            >
              {table.name}
            </th>
            <td className="py-condensed pr-normal text-right tabular-nums">
              {integerFormat.format(table.rowCount)}
            </td>
            <td className="py-condensed pr-normal text-right tabular-nums">
              {formatBytes(table.sizeInBytes)}
            </td>
            <td className="py-condensed tabular-nums">
              {table.lastModifiedAt === null ? (
                '—'
              ) : (
                <time dateTime={table.lastModifiedAt}>
                  {formatDate(table.lastModifiedAt)}
                </time>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
