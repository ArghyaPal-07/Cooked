"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    // Send them back to home page with the code attached
    if (code) {
      router.push(`/?code=${code}`);
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="h-screen bg-black flex items-center justify-center text-white">
      Processing...
    </div>
  );
}