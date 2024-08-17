import { Icon, Skelton } from 'ui';

export async function ArticlesSkelton() {
  return (
    <div className="grid grid-cols-[subgrid] col-span-full py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-full gap-12 place-content-start">
        {Array.from({ length: 6 }).map(() => (
          <Skelton className="flex flex-col gap-3">
            <Skelton.Box className="py-48">
              <Icon
                name="photo"
                color="var(--color-base-white)"
                width={30}
                height={30}
              />
            </Skelton.Box>
            <div className="flex flex-row gap-4">
              <Skelton.Round>
                <Icon
                  name="user"
                  appearance="solid"
                  color="var(--color-base-white)"
                  width={20}
                  height={20}
                />
              </Skelton.Round>
              <div className="flex justify-center flex-col gap-2 w-full">
                <Skelton.Line className="py-3 w-96" />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
              </div>
            </div>
          </Skelton>
        ))}
      </div>
    </div>
  );
}
