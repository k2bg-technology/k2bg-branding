import { Icon, Skelton } from 'ui';

export async function NotionMarkdownSkelton() {
  return (
    <div className="grid grid-cols-[subgrid] col-span-full">
      <div className="grid grid-cols-1 col-span-full place-content-start">
        <Skelton className="flex flex-col gap-8">
          {Array.from({ length: 2 }).map(() => (
            <div className="flex flex-row gap-4">
              <div className="flex justify-center flex-col gap-2 w-full">
                <Skelton.Line className="py-3 w-[50rem]" />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line />
                <Skelton.Line className="py-1 w-[10rem]" />
              </div>
            </div>
          ))}
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
