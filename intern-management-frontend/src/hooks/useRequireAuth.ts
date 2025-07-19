"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const useRequireAuth = () => {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading AND there's no token
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  return { token, isLoading };
};