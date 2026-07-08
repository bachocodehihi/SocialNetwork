'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectSwitchAccount() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=switch');
  }, [router]);
  return null;
}
