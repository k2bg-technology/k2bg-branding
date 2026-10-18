export function WarehouseUnavailable() {
  return (
    <section
      role="alert"
      className="flex flex-col gap-condensed rounded-lg border border-accent-default/50 bg-accent-light/15 p-4"
    >
      <h2 className="text-heading-5">Warehouse data unavailable</h2>
      <p className="text-body-r-sm">
        The table catalog could not be loaded. Check the dashboard definitions,
        the warehouse configuration, and the server logs.
      </p>
    </section>
  );
}
