import { Icon, Skelton } from 'ui';

export function ArticleHeadingSkelton() {
  return (
    <div className="grid grid-cols-[subgrid] col-span-full">
      <div className="grid grid-cols-1 col-span-full place-content-start">
        <Skelton className="flex flex-col gap-8">
          <div className="flex flex-row gap-4">
            <div className="flex justify-center flex-col gap-2 w-full">
              <Skelton.Line className="py-3 max-w-96" />
              <Skelton.Line className="py-6 max-w-[50rem]" />
              <Skelton.Line />
              <Skelton.Line />
              <Skelton.Line />
            </div>
          </div>
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
              <Skelton.Line className="py-3 max-w-96" />
              <Skelton.Line />
              <Skelton.Line />
              <Skelton.Line />
            </div>
          </div>
          <Skelton.Box className="py-52">
            <Icon
              name="photo"
              color="var(--color-base-white)"
              width={30}
              height={30}
            />
          </Skelton.Box>
        </Skelton>
      </div>
    </div>
  );
}
