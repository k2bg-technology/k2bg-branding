import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center grid-cols-[subgrid] gap-20 col-span-full py-[30px]">
      <Image
        src="/404.jpg"
        alt="404"
        width={500}
        height={500}
        className="aspect-square object-cover"
        sizes="100%"
      />
      <Link href="/" className="underline hover:opacity-80">
        ホーム画面へ戻る
      </Link>
    </div>
  );
}
