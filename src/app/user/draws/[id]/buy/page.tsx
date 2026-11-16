'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ImageUploader } from '@/components/AdminUI/ui/ImageUploader';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  Lock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_UPI_ID = 'sawariya@upi';
const ADMIN_QR_CODE =
  `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${ADMIN_UPI_ID}&pn=SawariyaLuckyDraw`;
const PROCESSING_FEE = 5;

interface Draw {
  id: string;
  title: string;
  entryFee: number;
  bannerImage: string | null;
  status: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  paymentId?: string;
}

export default function BuyTicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [draw, setDraw] = useState<Draw | null>(null);
  const [wallet, setWallet] = useState(0);
  const [useWallet, setUseWallet] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [drawRes, meRes] = await Promise.all([
          api.get<Draw>(`/user/draws/${id}`),
          api.get<{ wallet: number }>('/me'),
        ]);

        if (
          drawRes.success &&
          drawRes.data &&
          (drawRes.data as Draw).status === 'LIVE'
        ) {
          setDraw(drawRes.data as Draw);
        } else {
          setError('This contest is unavailable or has ended.');
        }

        if (meRes.success && meRes.data?.wallet !== undefined) {
          setWallet(meRes.data.wallet);
        }
      } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  const entryFee = draw?.entryFee || 0;
  const walletUsed = useWallet ? Math.min(wallet, entryFee) : 0;
  const remainingAmount = entryFee - walletUsed;
  const finalPayable = remainingAmount > 0 ? remainingAmount + PROCESSING_FEE : 0;

  const copyUpiId = async () => {
    await navigator.clipboard.writeText(ADMIN_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (finalPayable > 0) {
      if (!transactionId.trim()) {
        setError('Please enter the 12-digit UPI Transaction ID / UTR.');
        return;
      }
      if (!screenshot) {
        setError('Please upload your payment confirmation screenshot.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = (await api.post('/user/payments/manual', {
        drawId: id,
        transactionId: transactionId.trim() || null,
        screenshot: screenshot || null,
        walletUsed,
        processingFee: finalPayable > 0 ? PROCESSING_FEE : 0,
      })) as ApiResponse;

      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push('/user/tickets'), 2500);
      } else {
        setError(res.message || res.error || 'Payment failed.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Preparing Checkout Terminal...
        </p>
      </div>
    );
  }

  if (error && !draw) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 text-red-500 border border-red-200 dark:border-red-500/20">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Checkout Unavailable
        </h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => router.push('/user/draws')}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm"
        >
          Return to Draws
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Confirm & Secure Ticket
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Contest: {draw?.title}
          </p>
        </div>
      </div>

      {/* Success Modal / State */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {finalPayable === 0 ? 'Ticket Booked Instantly!' : 'Payment Submitted!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                {finalPayable === 0
                  ? 'Your ticket has been generated from your wallet balance.'
                  : 'Your payment proof has been submitted for admin verification.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Loader2 size={14} className="animate-spin" />
              <span>Redirecting to your Ticket Locker...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Summary & Wallet Calculation Card */}
          <div className="bg-white dark:bg-[#0F1626] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ticket Summary
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                1 Entry Ticket
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Contest Entry Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(entryFee)}
                </span>
              </div>

              {/* Wallet Usage Toggle */}
              {wallet > 0 && (
                <div className="pt-2 pb-2 border-y border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Use Wallet Balance
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ₹{wallet.toLocaleString('en-IN')} available
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {useWallet && walletUsed > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 px-1">
                      <span>Wallet Deduction</span>
                      <span>-{formatCurrency(walletUsed)}</span>
                    </div>
                  )}
                </div>
              )}

              {finalPayable > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Processing & Verification Fee</span>
                  <span>+{formatCurrency(PROCESSING_FEE)}</span>
                </div>
              )}

              {/* Net Payable Line */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Total Payable Now
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    {finalPayable === 0
                      ? 'Fully covered by wallet'
                      : 'Via UPI QR Code'}
                  </p>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(finalPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Dynamic Payment Mechanism */}
          {finalPayable === 0 ? (
            /* Wallet Covered 100% */
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Check size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Instant Wallet Booking Available
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Your wallet has sufficient balance. No external payment or screenshot upload required. Click confirm to issue your ticket immediately.
              </p>
            </div>
          ) : (
            /* UPI Payment Terminal */
            <div className="bg-white dark:bg-[#0F1626] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
                <CreditCard size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Step 1: Scan & Pay ₹{finalPayable} via UPI
                </h3>
              </div>

              {/* QR Container */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 dark:bg-[#121B2E] p-5 rounded-2xl border border-slate-200/80 dark:border-white/5">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={ADMIN_QR_CODE}
                    alt="Sawariya Official UPI QR Code"
                    className="w-36 h-36 mx-auto"
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Official UPI ID
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                      <code className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {ADMIN_UPI_ID}
                      </code>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="p-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Scan with PhonePe, Google Pay, Paytm, or BHIM. Pay the exact amount{' '}
                    <strong className="text-slate-900 dark:text-white">
                      ₹{finalPayable}
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Step 2: Verification Details Input */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-primary" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step 2: Enter UTR & Upload Screenshot
                  </h3>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    UPI Transaction ID (UTR / Reference No.) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 408271829102"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-sm font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Found in your UPI app transaction details (12 digits).
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Payment Receipt Screenshot *
                  </label>
                  <div className="bg-slate-50 dark:bg-[#090D16] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
                    <ImageUploader
                      value={screenshot}
                      onChange={(url) => setScreenshot(url)}
                      label="Upload UPI Payment Proof"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Processing Order...</span>
              </>
            ) : finalPayable === 0 ? (
              <>
                <CheckCircle size={18} />
                <span>Confirm & Issue Ticket Instantly</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Submit Payment & Request Ticket</span>
              </>
            )}
          </button>

          {/* Security Disclaimer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-emerald-500" />
            <span>256-Bit SSL Encrypted & Audited Transactions</span>
          </div>
        </form>
      )}
    </div>
  );
}
