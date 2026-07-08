'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectActivity() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=activity');
  }, [router]);
  return null;
}
