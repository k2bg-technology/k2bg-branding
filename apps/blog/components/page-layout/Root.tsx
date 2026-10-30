import { cn } from 'ui';
import { Footer } from '../footer/Footer';
import { Header } from '../header/Header';

interface Props {
  children: React.ReactNode;
  fab?: React.ReactNode;
  className?: string;
}

export function Root({ children, fab, className }: Props) {
  return (
    <div className="min-h-screen grid grid-rows-[3rem_1fr_18.75rem] grid-cols-[1fr_calc(100%-3rem)_1fr] md:grid-cols-[1fr_46rem_1fr] xl:grid-cols-[1fr_77rem_1fr]">
      <main
        className={cn(
          'col-start-2 -col-end-2 grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-x-8 gap-y-12 py-12',
          className
        )}
      >
        {children}
      </main>
      <Footer />
      <Header />
      {fab}
    </div>
  );
}
