interface Props {
  title: string;
}

export function SidebarItem(props: React.PropsWithChildren<Props>) {
  const { title, children } = props;

  return (
    <div>
      <p className="mb-6 text-subtitle-sm font-bold border-b-2 border-b-slate-100">
        {title}
      </p>
      {children}
    </div>
  );
}
