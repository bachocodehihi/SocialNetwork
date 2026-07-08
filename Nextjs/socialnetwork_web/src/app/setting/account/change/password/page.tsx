'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectChangePassword() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/setting?tab=change-password');
  }, [router]);
  return null;
}
