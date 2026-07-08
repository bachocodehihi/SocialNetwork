'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectLanguage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=language');
  }, [router]);
  return null;
}
