'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';

interface WalletTx {
    id: string;
    amount: number;
    balanceAfter: number;
    type: 'CREDIT' | 'DEBIT';
    remark: string;
    createdAt: string;
}
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export default function WalletTransactionPage() {
    const [data, setData] = useState<WalletTx[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await api.get<ApiResponse<WalletTx[]>>(
                '/user/transaction/wallet'
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
                <h1 className="text-2xl font-black mb-6">Wallet Transactions</h1>

                {data.length === 0 ? (
                    <p className="text-sm text-gray-500">No wallet activity found</p>
                ) : (
                    <div className="space-y-3">
                        {data.map(tx => (
                            <div key={tx.id}
                                className="flex justify-between items-center bg-white dark:bg-[#151922]
                           border border-gray-200 dark:border-white/10 rounded-xl p-4">
                                <div className="flex gap-3 items-center">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                    ${tx.type === 'CREDIT'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-red-100 text-red-500'
                                        }`}>
                                        {tx.type === 'CREDIT'
                                            ? <ArrowDownLeft size={16} />
                                            : <ArrowUpRight size={16} />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{tx.remark}</p>
                                        <p className="text-[11px] text-gray-500">
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={`font-black text-sm
                    ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                    </p>
                                    <p className="text-[11px] text-gray-400">
                                        Bal ₹{tx.balanceAfter}
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
