'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Loader2, Users } from 'lucide-react';

interface ReferredUser {
  id: string;
  name: string;
  mobile: string;
  joinedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function ReferredUsersPage() {
  const [data, setData] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.get<ApiResponse<ReferredUser[]>>(
        '/user/referrals'
      );

      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
      }
    }

    load().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Users className="text-purple-500" size={22} />
          Referred Users
        </h1>

        {data.length === 0 ? (
          <p className="text-sm text-gray-500">
            No users have joined using your referral code yet.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map(u => (
              <div
                key={u.id}
                className="bg-white dark:bg-[#151922] border border-gray-200
                           dark:border-white/10 rounded-xl p-4 flex justify-between"
              >
                {/* LEFT */}
                <div>
                  <p className="font-bold text-sm">{u.name}</p>
                  <p className="text-[11px] text-gray-500">
                    Mobile: {u.mobile}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">
                    Joined
                  </p>
                  <p className="text-[11px] font-medium">
                    {new Date(u.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
