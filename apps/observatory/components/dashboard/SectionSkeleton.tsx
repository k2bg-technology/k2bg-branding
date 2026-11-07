import { Skeleton } from 'ui';

export function SectionSkeleton() {
  return (
    <Skeleton className="flex flex-col gap-spacious rounded-xl border border-base-default/15 bg-white p-6 shadow-xs">
      <Skeleton.Line className="h-6 w-48" />
      <Skeleton.Box className="h-40 w-full" />
    </Skeleton>
  );
}
