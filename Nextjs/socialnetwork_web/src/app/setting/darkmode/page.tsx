'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectDarkmode() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=darkmode');
  }, [router]);
  return null;
}
