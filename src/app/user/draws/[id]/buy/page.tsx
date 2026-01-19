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
  UploadCloud,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

/* ---------------- CONFIG ---------------- */

const ADMIN_QR_CODE =
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=admin@upi&pn=SawariyaApp';

const PROCESSING_FEE = 5; // ₹5 processing fee

/* ---------------- TYPES ---------------- */

interface Draw {
  id: string;
  title: string;
  entryFee: number;
  status: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/* ================= PAGE ================= */

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

  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState('');

  /* ---------------- LOAD DRAW + WALLET ---------------- */

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
          setError('This draw is unavailable or has ended.');
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

  /* ---------------- CALCULATIONS ---------------- */

  const entryFee = draw?.entryFee || 0;
  const walletUsed = useWallet ? Math.min(wallet, entryFee) : 0;
  const remainingAmount = entryFee - walletUsed;
  const finalPayable = remainingAmount + PROCESSING_FEE;

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (finalPayable > 0) {
      if (!transactionId.trim()) {
        setError('Please enter Transaction ID (UTR).');
        return;
      }
      if (!screenshot) {
        setError('Please upload payment screenshot.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await api.post('/user/payments/manual', {
        drawId: id,
        transactionId: transactionId.trim() || null,
        screenshot: screenshot || null,
        walletUsed,
        processingFee: PROCESSING_FEE,
      }) as ApiResponse;

      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push('/user/tickets'), 3000);
      } else {
        setError(res.message || res.error || 'Payment failed.');
      }
    } catch {
      setError('Unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p>{error}</p>
        <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-black text-white rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Submitted</h2>
          <p className="text-gray-500">
            Your ticket will be issued after admin approval.
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-lg mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-xl">
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        {/* AMOUNT */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white mb-6">
          <p className="text-sm opacity-80">Entry Fee</p>
          <h2 className="text-4xl font-black">
            {formatCurrency(entryFee)}
          </h2>
          <p className="text-xs opacity-70 mt-2">{draw.title}</p>
        </div>

        {/* WALLET */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-bold">Use Wallet</p>
              <p className="text-xs text-gray-500">Available ₹{wallet}</p>
            </div>
            <input
              type="checkbox"
              checked={useWallet}
              onChange={() => setUseWallet(!useWallet)}
              className="w-5 h-5 accent-purple-600"
            />
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Entry Fee</span>
              <span>₹{entryFee}</span>
            </div>
            {walletUsed > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Wallet Used</span>
                <span>- ₹{walletUsed}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Processing Fee</span>
              <span>₹{PROCESSING_FEE}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Payable</span>
              <span>₹{finalPayable}</span>
            </div>
          </div>
        </div>

        {/* QR */}
        {finalPayable > 0 && (
          <div className="bg-white rounded-3xl p-6 text-center mb-6">
            <CreditCard className="mx-auto mb-3 text-purple-600" />
            <img src={ADMIN_QR_CODE} className="w-40 h-40 mx-auto mb-3" />
            <p className="text-xs text-gray-500">Scan & Pay</p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {finalPayable > 0 && (
            <>
              <input
                type="text"
                placeholder="Transaction ID / UTR"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-4 rounded-2xl border"
              />

              <ImageUploader
                value={screenshot}
                onChange={setScreenshot}
                folder="payments"
                label="Upload Screenshot"
              />
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold"
          >
            {submitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
