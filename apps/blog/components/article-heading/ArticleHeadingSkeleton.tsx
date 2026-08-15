import { Icon, Skeleton } from 'ui';

export function ArticleHeadingSkeleton() {
  return (
    <div className="grid grid-cols-[subgrid] col-span-full">
      <div className="grid grid-cols-1 col-span-full place-content-start">
        <Skeleton className="flex flex-col gap-8">
          <div className="flex flex-row gap-4">
            <div className="flex justify-center flex-col gap-2 w-full">
              <Skeleton.Line className="py-3 max-w-96" />
              <Skeleton.Line className="py-6 max-w-[50rem]" />
              <Skeleton.Line />
              <Skeleton.Line />
              <Skeleton.Line />
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <Skeleton.Round>
              <Icon
                name="user"
                appearance="solid"
                color="var(--color-base-white)"
                width={20}
                height={20}
              />
            </Skeleton.Round>
            <div className="flex justify-center flex-col gap-2 w-full">
              <Skeleton.Line className="py-3 max-w-96" />
              <Skeleton.Line />
              <Skeleton.Line />
              <Skeleton.Line />
            </div>
          </div>
          <Skeleton.Box className="py-52">
            <Icon
              name="photo"
              color="var(--color-base-white)"
              width={30}
              height={30}
            />
          </Skeleton.Box>
        </Skeleton>
      </div>
    </div>
  );
}
