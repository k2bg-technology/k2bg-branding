import { Skeleton } from 'ui';

export function SectionSkeleton() {
  return (
    <Skeleton className="flex flex-col gap-spacious rounded-lg border border-base-default/20 p-6">
      <Skeleton.Line className="h-6 w-48" />
      <Skeleton.Box className="h-40 w-full" />
    </Skeleton>
  );
}
