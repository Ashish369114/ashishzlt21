import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2, ShieldCheck, Download, X, Lock, QrCode, Smartphone, Check } from 'lucide-react';

const OnlineFeePaymentModal = ({ isOpen, onClose, feeItem, studentData, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'Credit Card', 'Net Banking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiId, setUpiId] = useState('parent@upi');
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
  const studentName = studentData?.name || studentData?.firstName || 'Ramesh Kumar';

  const handleProcessPayment = () => {
    setLoading(true);

    // Simulate realistic 1.5s mock payment processing gateway
    setTimeout(() => {
      const generatedTxn = `UPI-TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const paymentDateStr = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const details = {
        status: 'Successful',
        transactionId: generatedTxn,
        amount: amountToPay,
        paymentMethod: paymentMethod === 'UPI' ? `UPI (${selectedUpiApp || upiId})` : paymentMethod,
        date: paymentDateStr,
        studentName
      };

      setTxnDetails(details);
      setIsSuccess(true);
      setLoading(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(feeItem?._id || feeItem?.id);
      }
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `ABC INTERNATIONAL SCHOOL - OFFICIAL FEE PAYMENT RECEIPT\n` +
      `=============================================================\n` +
      `Payment Status: SUCCESSFUL\n` +
      `Transaction ID: ${txnDetails?.transactionId || 'UPI-TXN-902813'}\n` +
      `Fee Title: ${feeTitle}\n` +
      `Student Name: ${studentName}\n` +
      `Amount Paid: ₹${amountToPay}\n` +
      `Payment Method: ${txnDetails?.paymentMethod || 'UPI'}\n` +
      `Payment Date: ${txnDetails?.date || new Date().toLocaleString()}\n` +
      `=============================================================\n` +
      `Thank you for your payment. Keep this receipt for reference.`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fee_Receipt_${txnDetails?.transactionId || 'UPI'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#0C4A86] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">Instant Online Fee Portal</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="p-6 space-y-5">
            {/* Fee Summary */}
            <div className="p-4 rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE] flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Paying For</span>
                <h4 className="font-black text-[#0C4A86] text-sm">{feeTitle}</h4>
                <p className="text-xs text-slate-600 font-bold">Student: {studentName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Amount Payable</span>
                <span className="text-2xl font-black text-emerald-600 block">₹{amountToPay.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-2">Select Payment Method:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI Payment', icon: Smartphone },
                  { id: 'Credit Card', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'Net Banking', label: 'Net Banking', icon: DollarSign }
                ].map((method) => {
                  const Icon = method.icon;
                  const isSel = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 text-center ${
                        isSel
                          ? 'border-[#0C4A86] bg-[#0C4A86] text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UPI Details Form (Req 11) */}
            {paymentMethod === 'UPI' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <span className="font-extrabold text-amber-900 block text-xs">Select Preferred UPI App or Enter Virtual Private Address (VPA):</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp(app);
                          setUpiId(`parent@${app.toLowerCase().replace(/\s+/g, '')}`);
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold transition text-center ${
                          selectedUpiApp === app
                            ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@upi"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-900 focus:border-[#0C4A86] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Credit Card Form */}
            {paymentMethod === 'Credit Card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={e => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardForm.cardHolder}
                    onChange={e => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardForm.cvv}
                      onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'Net Banking' && (
              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Select Bank</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 bg-white">
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Pay Now Button (Req 11) */}
            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-75 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Processing Payment...' : `Pay ₹${amountToPay.toLocaleString()} Now via ${paymentMethod}`}</span>
            </button>
          </div>
        ) : (
          /* Payment Success Confirmation (Req 11) */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-xl">Payment Successful!</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Fee payment completed successfully. Receipt generated below.</p>
            </div>

            {/* Confirmation Box (Req 11) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2.5 font-bold">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Successful ✓
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-black text-slate-900">{txnDetails?.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-black text-emerald-600 text-sm">₹{txnDetails?.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-900">{txnDetails?.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-medium text-slate-700">{txnDetails?.date}</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="flex-1 bg-[#0C4A86] hover:bg-[#0096DA] text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-3 rounded-2xl text-xs transition"
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
