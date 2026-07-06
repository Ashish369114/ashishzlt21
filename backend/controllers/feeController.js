const Fee = require('../models/Fee');
const Student = require('../models/Student');

const getFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeesByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const fees = await Fee.find({ student: studentId }).populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingFees = async (req, res) => {
  try {
    const fees = await Fee.find({ isPaid: false }).populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeesByParent = async (req, res) => {
  try {
    const parentUserId = req.user.userId;
    const students = await Student.find({ parentId: parentUserId });
    const studentIds = students.map((student) => student.userId);
    const fees = await Fee.find({ student: { $in: studentIds } }).populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFee = async (req, res) => {
  try {
    const fee = new Fee({
      ...req.body,
      installments: req.body.installments || 3,
      paidAmount: 0,
      paymentHistory: [],
      isPaid: false,
    });
    await fee.save();
    const populated = await fee.populate('student');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const payFee = async (req, res) => {
  try {
    const { feeId, paymentMethod, transactionId, paymentDetails, amount } = req.body;
    const resolvedTransactionId = transactionId || `TXN-TEST-${Date.now()}`;
    const paymentAmount = Number(amount || 0);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero.' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    const updatedPaidAmount = (fee.paidAmount || 0) + paymentAmount;
    const isFullyPaid = updatedPaidAmount >= fee.amount;

    fee.paidAmount = updatedPaidAmount;
    fee.paymentDate = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = resolvedTransactionId;
    fee.isPaid = isFullyPaid;
    fee.paymentHistory = fee.paymentHistory || [];
    fee.paymentHistory.push({
      amount: paymentAmount,
      paymentMethod,
      transactionId: resolvedTransactionId,
      paymentDate: new Date(),
      remark: paymentDetails?.remark || '',
    });
    fee.paymentDetails = paymentDetails || fee.paymentDetails || {};

    await fee.save();
    await fee.populate('student');

    // Update student's fees paid amount
    const student = await Student.findById(fee.student._id);
    if (student) {
      student.feesPaid = (student.feesPaid || 0) + paymentAmount;
      await student.save();
    }

    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('student');
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.json({ message: 'Fee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFees,
  getFeesByStudent,
  getFeesByParent,
  getPendingFees,
  addFee,
  payFee,
  updateFee,
  deleteFee,
};
