export function WarehouseUnavailable() {
  return (
    <section
      role="alert"
      className="flex flex-col gap-condensed rounded-md border border-accent-default bg-base-light p-normal"
    >
      <h2 className="text-heading-5">Warehouse data unavailable</h2>
      <p className="text-body-r-sm">
        The table catalog could not be loaded. Check the warehouse configuration
        and the server logs.
      </p>
    </section>
  );
}
