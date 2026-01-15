// src/app/user/draws/[id]/buy/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Draw } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import ImageUpload from '@/components/ui/Upload';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

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
    if (params.id) {
      api.get<Draw>(`/user/draws/${params.id}`).then(res => {
        if(res.success && res.data?.status === 'LIVE') {
          setDraw(res.data);
        }
        setLoading(false);
      });
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!transactionId.trim()) {
      setError('Transaction ID is required');
      return;
    }
    
    if (!screenshot) {
      setError('Payment screenshot is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await api.post('/user/tickets', { 
        drawId: params.id, 
        transactionId: transactionId.trim(), 
        screenshot 
      });
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/user/tickets');
        }, 2000);
      } else {
        setError(res.error || 'Failed to submit payment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!draw) return <ErrorState message="Draw unavailable or not accepting entries" />;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your payment is under review. You'll receive your ticket once approved by admin.
          </p>
          <div className="animate-pulse text-purple-600 text-sm">
            Redirecting to tickets...
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(draw.bannerImage || draw.products?.[0]?.image);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Complete Payment</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Draw Summary Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-6">
          <div className="relative h-48">
            <img 
              src={imageUrl}
              alt={draw.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg mb-1">{draw.title}</h3>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <p className="text-white/80 text-sm mb-1">Total Amount</p>
            <p className="text-4xl font-bold">{formatCurrency(draw.entryFee)}</p>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <h4 className="font-bold text-blue-900 mb-2">Payment Instructions</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Make payment via UPI/Bank Transfer</li>
            <li>Note down your transaction ID</li>
            <li>Upload payment screenshot below</li>
            <li>Submit for verification</li>
          </ol>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Transaction ID / Reference Number
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., UPI123456789 or TXN987654321"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
              disabled={submitting}
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <ImageUpload
              label="Payment Screenshot"
              value={screenshot}
              onChange={setScreenshot}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !transactionId.trim() || !screenshot}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Submitting...
              </span>
            ) : (
              'Submit Payment'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Your ticket will be generated after admin approval
        </p>
      </div>
    </div>
  );
}