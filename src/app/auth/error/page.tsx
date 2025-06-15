'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get('error');
    router.replace(`/login?error=${error || 'unknown'}`);
  }, [router, searchParams]);

  return null;
} 