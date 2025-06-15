'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl');
    const error = searchParams.get('error');
    
    let redirectUrl = '/login';
    if (callbackUrl) {
      redirectUrl += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }
    if (error) {
      redirectUrl += `${callbackUrl ? '&' : '?'}error=${error}`;
    }
    
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return null;
} 