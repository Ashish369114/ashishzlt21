const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: String,
    expenseType: {
      type: String,
      enum: ['Operational', 'Capital', 'Miscellaneous'],
      default: 'Operational',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
