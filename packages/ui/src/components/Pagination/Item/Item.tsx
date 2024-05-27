export interface PaginationItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Item(props: PaginationItemProps) {
  const { selected, children, ...rest } = props;

  return (
    <button
      {...rest}
      type="button"
      className={`px-[1.1rem] py-[0.7rem] rounded-[0.3rem] border border-base-light text-[16px] leading-[18px] ${
        selected
          ? 'bg-gradient-to-r from-main-light via-main-default to-main-light text-base-white pointer-events-none'
          : undefined
      }`}
    >
      {children}
    </button>
  );
}
