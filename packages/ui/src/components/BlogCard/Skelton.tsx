import { Icon } from '../Icon';

export default function Skelton() {
  return (
    <div
      role="status"
      className="p-normal border border-gray-200 rounded shadow animate-pulse md:p-spacious"
    >
      <div className="flex items-center justify-center py-32 mb-spacious bg-gray-300 rounded">
        <Icon
          name="photo"
          color="var(--color-base-white)"
          width={30}
          height={30}
        />
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full w-32 mb-normal" />
      <div className="h-1 bg-gray-200 rounded-full mb-normal" />
      <div className="h-1 bg-gray-200 rounded-full mb-normal" />
      <div className="h-1 bg-gray-200 rounded-full mb-normal" />
      <div className="h-1 bg-gray-200 rounded-full mb-normal" />
      <div className="h-1 bg-gray-200 rounded-full mb-normal" />
      <div className="h-1 bg-gray-200 rounded-full" />
      <div className="flex gap-condensed items-center mt-normal">
        <Icon
          name="user-circle"
          appearance="solid"
          color="var(--color-base-white)"
          width={30}
          height={30}
        />
        <div>
          <div className="h-1.5 bg-gray-200 rounded-full w-20 mb-condensed" />
          <div className="w-32 h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
