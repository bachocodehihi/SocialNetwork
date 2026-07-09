'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GroupRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/home/contact/friend');
  }, [router]);
  return null;
}
