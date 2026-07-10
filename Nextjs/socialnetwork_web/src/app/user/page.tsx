'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className='flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 transition-colors duration-200'>
      <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent'></div>
    </div>
  );
}
