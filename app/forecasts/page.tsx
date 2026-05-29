'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForecastsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('Checking auth...');
        const response = await fetch('/api/auth/session');
        console.log('Auth response:', response.status);
        
        if (!response.ok) {
          console.log('Auth failed, redirecting to /auth');
          router.push('/auth');
          return;
        }
        
        const session = await response.json();
        console.log('Session:', session);
        
        // Check if user has Ultimate access
        if (!session.user || (session.user.subscriptionTier !== 'ultimate' && !session.user.isSuperAdmin)) {
          console.log('Not Ultimate user, redirecting to /pricing');
          router.push('/pricing');
          return;
        }
        
        setAuthorized(true);
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Auth failed');
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Market Forecasts</h1>
          <p className="text-gray-600 mt-2">
            TimesFM-powered predictions for stocks, indices, and sectors
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Forecasts Coming Soon</h2>
          <p className="text-gray-600">
            Stock and index forecasts will be displayed here.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a href="/ultimate" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
