import { Icon, Skeleton as UISkeleton } from 'ui';

export async function Skeleton() {
  return (
    <div className="grid grid-cols-[subgrid] col-span-full">
      <div className="grid grid-cols-1 col-span-full place-content-start">
        <UISkeleton className="flex flex-col gap-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex flex-row gap-4">
              <div className="flex justify-center flex-col gap-2 w-full">
                <UISkeleton.Line className="py-3 max-w-[50rem]" />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line />
                <UISkeleton.Line className="py-1 max-w-[10rem]" />
              </div>
            </div>
          ))}
          <UISkeleton.Box className="py-52">
            <Icon
              name="photo"
              color="var(--color-base-white)"
              width={30}
              height={30}
            />
          </UISkeleton.Box>
        </UISkeleton>
      </div>
    </div>
  );
}
