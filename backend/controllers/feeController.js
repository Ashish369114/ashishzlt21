const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const User = require('../models/User');

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
    const parentIdentifier = req.user.userId;
    let studentIds = [];

    const loadStudentsForParent = async (parentRef) => {
      const students = await Student.find({ parentId: parentRef });
      return students.map((student) => student.userId);
    };

    if (mongoose.Types.ObjectId.isValid(parentIdentifier)) {
      studentIds = await loadStudentsForParent(parentIdentifier);
    }

    if (!studentIds.length) {
      const parentUser = await User.findOne({ userId: parentIdentifier });
      if (parentUser) {
        studentIds = await loadStudentsForParent(parentUser._id);
      }
    }

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

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    const outstandingAmount = Math.max(0, (Number(fee.amount) || 0) - (Number(fee.paidAmount) || 0));
    const paymentAmount = Number(amount || outstandingAmount || 0);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero.' });
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
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    const updateData = { ...req.body };

    if (updateData.amount !== undefined) {
      const nextAmount = Number(updateData.amount);
      fee.amount = nextAmount;
      if ((fee.paidAmount || 0) > nextAmount) {
        fee.paidAmount = nextAmount;
      }
      fee.isPaid = (fee.paidAmount || 0) >= nextAmount;
    }

    Object.assign(fee, updateData);
    await fee.save();

    const populatedFee = await fee.populate('student');
    res.json(populatedFee);
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

const deleteFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await Fee.deleteMany({ student: studentId });
    res.json({ message: 'Fees deleted', deletedCount: result.deletedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentsBySection = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    // Get all students in this class
    const students = await Student.find({ class: classId }).populate('userId');
    
    if (!students || students.length === 0) {
      return res.json([]);
    }

    // Get all fees for students in this class
    const studentIds = students.map((student) => student.userId?._id || student.userId || student._id);
    const fees = await Fee.find({ student: { $in: studentIds } });

    // Build response with student data and fee summary
    const studentsWithFees = students.map((student) => {
      const studentId = student.userId?._id || student.userId || student._id;
      const studentFees = fees.filter((fee) => String(fee.student) === String(studentId));
      
      const totalFee = studentFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
      const totalPending = totalFee - totalPaid;

      return {
        _id: student._id,
        studentId: studentId,
        rollNumber: student.rollNumber,
        firstName: student.userId?.firstName || student.firstName || '',
        lastName: student.userId?.lastName || student.lastName || '',
        totalFee,
        totalPaid,
        totalPending,
        isPaid: totalFee > 0 && totalPending <= 0,
        feeCount: studentFees.length,
      };
    });

    res.json(studentsWithFees);
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
  deleteFeesByStudent,
  getStudentsBySection,
};
