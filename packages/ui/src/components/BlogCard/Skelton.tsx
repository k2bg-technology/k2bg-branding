import { Icon } from '../Icon';

export default function Skelton() {
  return (
    <div
      role="status"
      className="p-4 border border-gray-200 rounded shadow animate-pulse md:p-6"
    >
      <div className="flex items-center justify-center py-48 mb-4 bg-gray-300 rounded">
        <Icon
          name="photo"
          color="var(--color-base-white)"
          width={30}
          height={30}
        />
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4" />
      <div className="h-2 bg-gray-200 rounded-full mb-2.5" />
      <div className="h-2 bg-gray-200 rounded-full mb-2.5" />
      <div className="h-2 bg-gray-200 rounded-full mb-2.5" />
      <div className="h-2 bg-gray-200 rounded-full mb-2.5" />
      <div className="h-2 bg-gray-200 rounded-full mb-2.5" />
      <div className="h-2 bg-gray-200 rounded-full" />
      <div className="flex gap-2 items-center mt-4">
        <Icon
          name="user-circle"
          appearance="solid"
          color="var(--color-base-white)"
          width={30}
          height={30}
        />
        <div>
          <div className="h-2.5 bg-gray-200 rounded-full w-32 mb-2" />
          <div className="w-48 h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
