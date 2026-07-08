'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectDeleteAccount() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=delete-account');
  }, [router]);
  return null;
}
