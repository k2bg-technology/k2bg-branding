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
    <table className="w-full border-collapse text-body-r-sm">
      <thead>
        <tr className="border-b border-base-default text-left">
          <th scope="col" className="py-condensed pr-normal">
            Dataset
          </th>
          <th scope="col" className="py-condensed pr-normal">
            Table
          </th>
          <th scope="col" className="py-condensed pr-normal">
            Type
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
          <tr
            key={`${table.datasetId}.${table.name}`}
            className="border-b border-base-light"
          >
            <td className="py-condensed pr-normal">{table.datasetId}</td>
            <th
              scope="row"
              className="py-condensed pr-normal text-left font-normal"
            >
              {table.name}
            </th>
            <td className="py-condensed pr-normal">{table.type}</td>
            <td className="py-condensed pr-normal text-right tabular-nums">
              {table.rowCount === null
                ? '—'
                : integerFormat.format(table.rowCount)}
            </td>
            <td className="py-condensed pr-normal text-right tabular-nums">
              {table.sizeInBytes === null
                ? '—'
                : formatBytes(table.sizeInBytes)}
            </td>
            <td className="py-condensed tabular-nums">
              {table.lastModifiedAt === null ? (
                '—'
              ) : (
                <time dateTime={table.lastModifiedAt}>
                  {table.lastModifiedAt.slice(0, 10)}
                </time>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
