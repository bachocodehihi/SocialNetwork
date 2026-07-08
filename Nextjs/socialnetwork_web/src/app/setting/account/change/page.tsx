'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectChangeInfo() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=change-info');
  }, [router]);
  return null;
}
