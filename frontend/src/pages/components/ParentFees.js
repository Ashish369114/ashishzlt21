import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import OnlineFeePaymentModal from '../dashboards/components/OnlineFeePaymentModal';

const defaultFeesList = [
  {
    _id: 'fee1',
    title: 'Term 2 Tuition & Academic Fee',
    feeType: 'Tuition Fee',
    amount: 15000,
    paidAmount: 15000,
    dueDate: '2026-08-15',
    isPaid: true,
    transactionId: 'TXN-902812',
    student: { firstName: 'Ramesh', lastName: 'Kumar' }
  },
  {
    _id: 'fee2',
    title: 'School Transport & Bus Service Fee',
    feeType: 'Transport Fee',
    amount: 3500,
    paidAmount: 3500,
    dueDate: '2026-08-10',
    isPaid: true,
    transactionId: 'TXN-902813',
    student: { firstName: 'Ramesh', lastName: 'Kumar' }
  },
  {
    _id: 'fee3',
    title: 'Mid-Term Examination & Lab Evaluation Fee',
    feeType: 'Exam Fee',
    amount: 1200,
    paidAmount: 0,
    dueDate: '2026-08-20',
    isPaid: false,
    student: { firstName: 'Ramesh', lastName: 'Kumar' }
  },
  {
    _id: 'fee4',
    title: 'Annual Sports & Science Activity Fee',
    feeType: 'Activity Fee',
    amount: 800,
    paidAmount: 0,
    dueDate: '2026-08-25',
    isPaid: false,
    student: { firstName: 'Ramesh', lastName: 'Kumar' }
  }
];

const ParentFees = ({ isPaymentMode = false, selectedStudentId, student }) => {
  const navigate = useNavigate();
  const [feesList, setFeesList] = useState(defaultFeesList);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);

  const studentName = student?.name || student?.userId?.firstName || 'Ramesh Kumar';

  const calculateTotalPaid = () => {
    return feesList.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
  };

  const calculateTotalPending = () => {
    return feesList.reduce(
      (sum, f) => sum + Math.max(Number(f.amount || 0) - Number(f.paidAmount || 0), 0),
      0
    );
  };

  const calculateTotalFeeAmount = () => {
    return feesList.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  };

  const handlePaymentSuccess = (paidFeeId) => {
    setFeesList((prev) =>
      prev.map((f) =>
        f._id === paidFeeId
          ? { ...f, isPaid: true, paidAmount: f.amount, transactionId: `UPI-TXN-${Date.now()}` }
          : f
      )
    );
    setSelectedFeeForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Fee Portal
            </span>
          </div>
          <h1 className="text-2xl font-black">{studentName}'s Fee Details & Payments</h1>
          <p className="text-sky-100 text-xs font-medium">Review tuition, transport, examination & activity fee ledgers with instant online UPI payments.</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs font-bold">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1">
          <span className="text-slate-400 uppercase text-[10px] block">Total Fee Items</span>
          <span className="text-2xl font-black text-slate-900">{feesList.length} Items</span>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-2xs space-y-1">
          <span className="text-emerald-800 uppercase text-[10px] block">Paid Amount</span>
          <span className="text-2xl font-black text-emerald-700">₹{calculateTotalPaid().toLocaleString()}</span>
        </div>
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs space-y-1">
          <span className="text-rose-800 uppercase text-[10px] block">Pending Amount</span>
          <span className="text-2xl font-black text-rose-700">₹{calculateTotalPending().toLocaleString()}</span>
        </div>
        <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-4 shadow-2xs space-y-1">
          <span className="text-blue-800 uppercase text-[10px] block">Total Fee Ledger</span>
          <span className="text-2xl font-black text-blue-700">₹{calculateTotalFeeAmount().toLocaleString()}</span>
        </div>
      </div>

      {/* Fee Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#0C4A86]">Student Fee Ledger & Payment Status</h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            Instant Online Payment Active ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <th className="p-3">Fee Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {feesList.map((fee) => {
                const paid = Number(fee.paidAmount || 0);
                const pending = Math.max(Number(fee.amount || 0) - paid, 0);

                return (
                  <tr key={fee._id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-[#0C4A86]">{fee.title}</td>
                    <td className="p-3 font-black text-slate-900">₹{fee.amount}</td>
                    <td className="p-3 text-emerald-700 font-bold">₹{paid}</td>
                    <td className="p-3 text-rose-700 font-bold">₹{pending}</td>
                    <td className="p-3 text-slate-500">{fee.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                        fee.isPaid || pending === 0
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {fee.isPaid || pending === 0 ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      {!fee.isPaid && pending > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedFeeForPayment(fee)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-2xs hover:bg-emerald-700 transition"
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Pay Now
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert(`Downloading Receipt for ${fee.title} (Txn: ${fee.transactionId || 'TXN-902812'})...`)}
                          className="inline-flex items-center gap-1 text-[#0C4A86] underline font-extrabold hover:text-black"
                        >
                          <Download className="h-3.5 w-3.5" /> Receipt PDF
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Fee Payment Modal */}
      {selectedFeeForPayment && (
        <OnlineFeePaymentModal
          isOpen={!!selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
          feeItem={selectedFeeForPayment}
          studentData={{ name: studentName, ...student }}
          onPaymentSuccess={() => handlePaymentSuccess(selectedFeeForPayment._id)}
        />
      )}
    </div>
  );
};

export default ParentFees;
