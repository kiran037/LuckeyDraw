"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
    id: string;
    referrerBonus: number;
    refereeBonus: number;
}

export default function SettingsForm({ id, referrerBonus, refereeBonus }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        id:id,
        referrerBonus: referrerBonus,
        refereeBonus: refereeBonus,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`/api/admin/settings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update settings");
            }

            setSuccess(true);
            router.refresh();

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            referrerBonus: referrerBonus,
            refereeBonus: refereeBonus,
        });
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            {/* FORM HEADER */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>🎁</span>
                    Referral Bonus Configuration
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Set bonus amounts for referral program</p>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* SUCCESS MESSAGE */}
                {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Settings updated successfully!
                        </p>
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* FORM FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* REFERRER BONUS */}
                    <div className="space-y-2">
                        <label htmlFor="referrerBonus" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Referrer Bonus
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                                ₹
                            </span>
                            <input
                                type="number"
                                id="referrerBonus"
                                required
                                min="0"
                                step="0.01"
                                value={formData.referrerBonus}
                                onChange={(e) => setFormData({ ...formData, referrerBonus: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-zinc-900 dark:text-white transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Amount credited to the person who refers</span>
                        </p>
                    </div>

                    {/* REFEREE BONUS */}
                    <div className="space-y-2">
                        <label htmlFor="refereeBonus" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Referee Bonus
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                                ₹
                            </span>
                            <input
                                type="number"
                                id="refereeBonus"
                                required
                                min="0"
                                step="0.01"
                                value={formData.refereeBonus}
                                onChange={(e) => setFormData({ ...formData, refereeBonus: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-zinc-900 dark:text-white transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Amount credited to the person being referred</span>
                        </p>
                    </div>
                </div>

                {/* INFO BOX */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                How Referral Bonus Works
                            </h3>
                            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                    <span><strong>Referrer Bonus:</strong> When someone signs up using a referral code, the referrer gets this amount</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                    <span><strong>Referee Bonus:</strong> The new user who signs up also receives this welcome bonus</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                    <span>Both amounts are credited to wallet automatically upon successful registration</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Referrer Gets</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        ₹{formData.referrerBonus.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-lg">🎁</span>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">New User Gets</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        ₹{formData.refereeBonus.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Reset</span>
                    </button>
                </div>
            </form>
        </div>
    );
}