import { Icon, Skeleton } from 'ui';

export async function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-[subgrid] col-span-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-8 place-content-start">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="flex flex-col gap-3">
            <Skeleton.Box className="h-[16rem] rounded-xl">
              <Icon
                name="photo"
                color="var(--color-base-white)"
                width={30}
                height={30}
              />
            </Skeleton.Box>
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
                <Skeleton.Line className="py-3" />
                <Skeleton.Line />
                <Skeleton.Line />
                <Skeleton.Line />
              </div>
            </div>
          </Skeleton>
        ))}
      </div>
    </div>
  );
}
