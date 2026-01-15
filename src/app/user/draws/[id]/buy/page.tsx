'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import ImageUpload from '@/components/ui/Upload';
import { ArrowLeft, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Replace this with your actual Admin QR Code URL
const ADMIN_QR_CODE = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=admin@upi&pn=DrawApp"; 

interface Draw {
  id: string;
  title: string;
  entryFee: number;
  status: string;
  bannerImage: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default function BuyTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (params.id) {
        try {
          // Reusing the same details API, but we just need basic info
const res = await api.get<Draw>(`/user/draws/${params.id}`);
          if(res.success && res.data?.status === 'LIVE') {
            setDraw(res.data);
          } else {
            setError("Draw unavailable");
          }
        } catch(e) { setError("Network error"); }
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!transactionId.trim()) { setError('Transaction ID is required'); return; }
    if (!screenshot) { setError('Payment screenshot is required'); return; }
    
    setSubmitting(true);
    
    try {
      // FIX: Post to the new manual submit route
      const res = await api.post('/user/payments/submit', { 
        drawId: params.id, 
        transactionId: transactionId.trim(), 
        screenshot 
}) as ApiResponse<unknown>;
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/user/tickets'); // Or back to draw details
        }, 3000);
      } else {
        setError(res.message || res.error || 'Failed to submit payment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><LoadingSpinner /></div>;
  if (!draw) return <ErrorState message="Draw unavailable" />;

  if (success) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#151922] border border-white/10 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Payment Submitted!</h2>
          <p className="text-gray-400 mb-6">
            Your payment is under review. You'll receive your ticket once approved by admin.
          </p>
          <div className="animate-pulse text-purple-400 text-sm">
            Redirecting to tickets...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 pb-24">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-[#151922] border border-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Complete Payment</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Amount Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 mb-6 shadow-lg shadow-purple-900/20">
            <p className="text-white/80 text-sm mb-1">Total Payable</p>
            <h2 className="text-4xl font-black text-white">{formatCurrency(draw.entryFee)}</h2>
            <p className="text-white/60 text-xs mt-2">{draw.title}</p>
        </div>

        {/* QR Section */}
        <div className="bg-[#151922] border border-white/5 rounded-2xl p-6 mb-6 text-center">
          <h4 className="font-bold text-white mb-4">Scan to Pay</h4>
          <div className="bg-white p-4 rounded-xl inline-block mb-4">
             <img src={ADMIN_QR_CODE} alt="Admin QR" className="w-40 h-40" />
          </div>
          <p className="text-xs text-gray-400">
             Scan using any UPI app (GPay, PhonePe, Paytm)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#151922] border border-white/5 rounded-3xl p-6">
            <label className="block text-sm font-bold text-gray-400 mb-3">
              Transaction ID (UTR)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., 34568912300"
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
              required
              disabled={submitting}
            />
          </div>

          <div className="bg-[#151922] border border-white/5 rounded-3xl p-6">
            <ImageUpload
              value={screenshot}
              onChange={setScreenshot}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !transactionId.trim() || !screenshot}
            className="w-full py-4 bg-white text-black rounded-[1.5rem] font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}