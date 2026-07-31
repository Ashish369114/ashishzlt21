import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2, ShieldCheck, Download, X, Lock } from 'lucide-react';
import { paymentService } from '../../../services/api';

const OnlineFeePaymentModal = ({ isOpen, onClose, feeItem, studentData, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);

  const [cardForm, setCardForm] = useState({
    cardNumber: '4532 •••• •••• 8892',
    cardHolder: studentData?.name ? `Parent of ${studentData.name}` : 'Parent Name',
    expiry: '12/28',
    cvv: '•••',
  });

  if (!isOpen) return null;

  const feeTitle = feeItem?.title || feeItem?.feeType || 'Quarterly Tuition Fee';
  const amountToPay = feeItem?.pendingAmount || feeItem?.amount || 1500;

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      const res = await paymentService.payFee({
        feeId: feeItem?.id || null,
        feeType: feeTitle,
        amount: amountToPay,
        paymentMethod,
        studentId: studentData?.userId || studentData?.id || 'STUDENT001',
      });

      if (res.data && res.data.success) {
        setIsSuccess(true);
        setTxnDetails(res.data);
        if (onPaymentSuccess) onPaymentSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Secure Online Fee Payment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="p-6">
            {/* Payment Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Paying For</span>
                <h4 className="font-bold text-slate-900 text-sm">{feeTitle}</h4>
                <p className="text-xs text-slate-500">{studentData?.name || 'Ramesh Sharma'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Amount Due</span>
                <span className="text-2xl font-black text-emerald-600 block">${amountToPay}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <label className="text-xs font-bold text-slate-700 block mb-2">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['Credit Card', 'UPI / QR', 'Net Banking'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === method
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            {paymentMethod === 'Credit Card' && (
              <div className="space-y-3 text-xs mb-6">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={e => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardForm.cardHolder}
                    onChange={e => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="w-full p-2.5 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      value={cardForm.cvv}
                      onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full p-2.5 border rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI / QR' && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center mb-6 text-xs">
                <div className="w-32 h-32 bg-white p-2 border rounded-xl mx-auto mb-3 flex items-center justify-center font-bold text-slate-400">
                  [UPI QR CODE]
                </div>
                <p className="font-bold text-slate-900">Scan using Google Pay, PhonePe, Paytm or UPI App</p>
                <span className="text-[11px] text-slate-500 block mt-1">UPI ID: greenwood@schoolbank</span>
              </div>
            )}

            {paymentMethod === 'Net Banking' && (
              <div className="mb-6 text-xs">
                <label className="font-bold text-slate-700 block mb-1">Select Bank</label>
                <select className="w-full p-2.5 border rounded-lg font-medium text-slate-900">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-200 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Processing Secure Payment...' : `Pay $${amountToPay} Now`}</span>
            </button>
          </div>
        ) : (
          /* Payment Success Confirmation */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-extrabold text-slate-900 text-xl">Payment Successful!</h3>
            <p className="text-xs text-slate-500 mt-1">Your fee payment has been received and confirmed by the school accountant.</p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{txnDetails?.transactionId || 'TXN102938'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600 text-sm">${amountToPay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-medium text-slate-900">{paymentMethod}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <a
                href={txnDetails?.data?.receiptUrl || `/api/payments/receipt/${txnDetails?.transactionId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt PDF</span>
              </a>
              <button
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnlineFeePaymentModal;
