export function SectionUnavailable() {
  return (
    <p
      role="alert"
      className="rounded-md border border-accent-default bg-base-light p-normal text-body-r-sm"
    >
      This section could not be loaded. Check the warehouse configuration and
      the server logs.
    </p>
  );
}
