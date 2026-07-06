const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    dueDate: {
      type: Date,
      required: true,
    },
    installments: {
      type: Number,
      default: 3,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['PhonePe', 'Credit Card', 'Debit Card', 'Cash', 'Cheque', 'Net Banking', 'UPI', 'Wallet'],
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentHistory: [
      {
        amount: Number,
        paymentMethod: String,
        transactionId: String,
        paymentDate: Date,
        remark: String,
      },
    ],
    paymentDetails: {
      phonePeId: String,
      cardHolderName: String,
      cardLast4: String,
      cardNetwork: String,
      chequeNumber: String,
      chequeBank: String,
      chequeDate: Date,
      chequeStatus: String,
      cashReceiptId: String,
      cashCounter: String,
      additionalInfo: String,
    },
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
