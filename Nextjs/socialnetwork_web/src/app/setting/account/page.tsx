'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectAccount() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=account');
  }, [router]);
  return null;
}
