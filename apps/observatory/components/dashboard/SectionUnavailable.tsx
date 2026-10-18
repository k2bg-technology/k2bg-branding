export function SectionUnavailable() {
  return (
    <p
      role="alert"
      className="rounded-lg border border-accent-default/50 bg-accent-light/15 p-4 text-body-r-sm"
    >
      This section could not be loaded. Check the warehouse configuration and
      the server logs.
    </p>
  );
}
