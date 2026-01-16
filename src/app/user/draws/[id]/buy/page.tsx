'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ImageUploader } from '@/components/AdminUI/ui/ImageUploader';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, CreditCard, UploadCloud } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Replace with your real Admin QR Code URL
const ADMIN_QR_CODE = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=admin@upi&pn=SawariyaApp"; 

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

export default function BuyTicketPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (id) {
        try {
          const res = await api.get<Draw>(`/user/draws/${id}`);
          if(res.success && res.data?.status === 'LIVE') {
            setDraw(res.data);
          } else {
            setError("This draw is unavailable or has ended.");
          }
        } catch(e) { 
          setError("Network error. Please check your connection."); 
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!transactionId.trim()) { 
      setError('Please enter the Transaction ID (UTR).'); 
      return; 
    }
    if (!screenshot) { 
      setError('Please upload the payment screenshot.'); 
      return; 
    }
    
    setSubmitting(true);
    
    try {
      // Calls the new manual payment route
      const res = await api.post('/user/payments/manual', { 
        drawId: id, 
        transactionId: transactionId.trim(), 
        screenshot 
      }) as ApiResponse;
      
      if (res.success) {
        setSuccess(true);
        // Auto-redirect after 3s
        setTimeout(() => {
          router.push('/user/tickets'); 
        }, 3000);
      } else {
        setError(res.message || res.error || 'Failed to submit payment.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Loading State ---
  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
    </div>
  );

  // --- Error State ---
  if (!draw && !loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
       <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
       <h3 className="text-xl font-bold text-gray-900 dark:text-white">Unavailable</h3>
       <p className="text-gray-500 dark:text-gray-400 mt-2">{error || "Draw details not found."}</p>
       <button 
         onClick={() => router.back()} 
         className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:scale-105 transition-transform"
       >
         Go Back
       </button>
    </div>
  );

  // --- Success State ---
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#151922] border border-gray-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Payment Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Your payment for <strong>{draw?.title}</strong> is under review. You'll receive your ticket once approved by admin.
          </p>
          <div className="animate-pulse text-purple-600 dark:text-purple-400 text-sm font-medium">
            Redirecting to your tickets...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white p-4 sm:p-6 pb-24 transition-colors duration-300">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white dark:bg-[#151922] border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Amount Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-purple-600 dark:to-pink-600 rounded-[2rem] p-6 mb-6 shadow-xl text-white">
            <p className="text-white/70 text-sm mb-1 font-medium">Total Payable Amount</p>
            <h2 className="text-4xl font-black">{formatCurrency(draw?.entryFee || 0)}</h2>
            <p className="text-white/60 text-xs mt-2 border-t border-white/10 pt-2 inline-block">For {draw?.title}</p>
        </div>

        {/* Payment Instructions & QR */}
        <div className="bg-white dark:bg-[#151922] border border-gray-200 dark:border-white/5 rounded-3xl p-6 mb-6 text-center shadow-sm">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
            <CreditCard size={18} className="text-purple-600" /> Scan QR to Pay
          </h4>
          <div className="bg-gray-50 dark:bg-white p-4 rounded-2xl inline-block mb-4 border border-gray-200 dark:border-transparent">
             <img src={ADMIN_QR_CODE} alt="Admin Payment QR Code" className="w-40 h-40 mix-blend-multiply" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-white/5 py-2 px-4 rounded-full inline-block">
             Use GPay, PhonePe, or Paytm
          </p>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* UTR Input */}
          <div className="bg-white dark:bg-[#151922] border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
            <label htmlFor="transaction-id" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
              Transaction ID / UTR Number
            </label>
            <input
              id="transaction-id"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., 34568912300"
              className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-mono text-sm"
              required
              disabled={submitting}
            />
            <p className="text-[10px] text-gray-400 mt-2 ml-1">
              Usually a 12-digit number found in your payment app details.
            </p>
          </div>

          {/* Screenshot Upload */}
          <div className="bg-white dark:bg-[#151922] border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 ml-1">
              <UploadCloud size={16} className="text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Upload Payment Screenshot
              </span>
            </div>
            <ImageUploader
              value={screenshot}
              onChange={setScreenshot}
              folder="payments"
              label=""
            />
            <p className="text-[10px] text-gray-400 mt-2 ml-1">
              Clear screenshot showing transaction details and UTR number
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !transactionId.trim() || !screenshot}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} /> Processing...
              </span>
            ) : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}