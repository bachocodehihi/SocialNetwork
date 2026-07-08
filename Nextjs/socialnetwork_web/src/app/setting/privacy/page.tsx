'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPrivacy() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=privacy');
  }, [router]);
  return null;
}
