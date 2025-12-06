'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface CacheStats {
  totalGenerations: number;
  cacheHitRate: number;
  avgResponseTime: number;
  topUsers: Array<{ userId: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<CacheStats>({
    totalGenerations: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    topUsers: [],
  });
  const [redisAvailable, setRedisAvailable] = useState<boolean | null>(null);

  // Get all generations from Convex
  const allGenerations = useQuery(api.queries.listGenerations, { limit: 100 });

  useEffect(() => {
    async function checkRedis() {
      try {
        const response = await fetch('/api/admin/cache-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setRedisAvailable(true);
        } else {
          setRedisAvailable(false);
        }
      } catch (error) {
        setRedisAvailable(false);
        console.log('Redis not available');
      }
    }

    checkRedis();
    const interval = setInterval(checkRedis, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allGenerations) {
      setStats(prev => ({
        ...prev,
        totalGenerations: allGenerations.length,
      }));
    }
  }, [allGenerations]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Metalink Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor cache performance and system metrics
          </p>
        </div>

        {/* Redis Status Banner */}
        <div className={`mb-6 p-4 rounded-lg ${redisAvailable ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${redisAvailable ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <div>
              <p className="font-semibold text-gray-900">
                {redisAvailable === null ? 'Checking Redis...' : redisAvailable ? 'Redis Connected' : 'Redis Not Available'}
              </p>
              <p className="text-sm text-gray-600">
                {redisAvailable 
                  ? 'Caching and rate limiting active'
                  : 'App running without cache (slower but functional)'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Generations */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-medium">Total Generations</div>
              <div className="text-3xl">🎨</div>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {stats.totalGenerations}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              All time
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-medium">Cache Hit Rate</div>
              <div className="text-3xl">⚡</div>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {redisAvailable ? `${stats.cacheHitRate.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {redisAvailable ? 'Cost savings active' : 'Enable Redis to track'}
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-medium">Avg Response Time</div>
              <div className="text-3xl">⏱️</div>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {redisAvailable ? `${stats.avgResponseTime.toFixed(1)}s` : '~5s'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {redisAvailable ? 'With cache hits' : 'Without caching'}
            </div>
          </div>
        </div>

        {/* Recent Generations */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Generations</h2>
          
          {!allGenerations || allGenerations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No generations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Material</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allGenerations.slice(0, 10).map((gen: any) => (
                    <tr key={gen._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{gen.description}</td>
                      <td className="py-3 px-4 text-gray-600">{gen.specifications?.material?.grade || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          gen.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : gen.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {gen.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(gen.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Setup Instructions (if Redis not available) */}
        {redisAvailable === false && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              🚀 Enable Redis for Better Performance
            </h3>
            <p className="text-blue-800 mb-4">
              Set up Upstash Redis to enable caching and unlock 10x faster responses!
            </p>
            <ol className="list-decimal list-inside space-y-2 text-blue-900">
              <li>Create a free account at <a href="https://console.upstash.com/" target="_blank" className="underline font-semibold">console.upstash.com</a></li>
              <li>Create a new Redis database</li>
              <li>Copy the REST URL and Token</li>
              <li>Add them to your Convex environment variables:
                <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                  <li><code className="bg-blue-100 px-2 py-0.5 rounded">UPSTASH_REDIS_REST_URL</code></li>
                  <li><code className="bg-blue-100 px-2 py-0.5 rounded">UPSTASH_REDIS_REST_TOKEN</code></li>
                </ul>
              </li>
            </ol>
            <p className="mt-4 text-sm text-blue-700">
              See <code className="bg-blue-100 px-2 py-0.5 rounded">docs/REDIS_SETUP.md</code> for detailed instructions
            </p>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

