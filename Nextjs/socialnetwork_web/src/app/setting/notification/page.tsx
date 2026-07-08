'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectNotification() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=notification');
  }, [router]);
  return null;
}
