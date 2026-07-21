const { Fee, Student, User } = require('../models');

const getFees = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeesByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const fees = await Fee.findAll({ 
      where: { studentId },
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingFees = async (req, res) => {
  try {
    const fees = await Fee.findAll({ 
      where: { isPaid: false },
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });
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
      const students = await Student.findAll({ where: { parentId: parentRef } });
      return students.map((student) => student.id);
    };

    const isNumeric = !isNaN(parentIdentifier);
    if (isNumeric) {
      studentIds = await loadStudentsForParent(parentIdentifier);
    }

    if (!studentIds.length) {
      const parentUser = await User.findOne({ where: { userId: parentIdentifier } });
      if (parentUser) {
        studentIds = await loadStudentsForParent(parentUser.id);
      }
    }

    const fees = await Fee.findAll({ 
      where: { studentId: studentIds },
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFee = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      studentId: req.body.student, // Mapping standard req body from frontend
      installments: req.body.installments || 3,
      paidAmount: 0,
      paymentHistory: [],
      isPaid: false,
    };
    const fee = await Fee.create(payload);
    const populated = await Fee.findByPk(fee.id, {
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const payFee = async (req, res) => {
  try {
    const { feeId, paymentMethod, transactionId, paymentDetails, amount } = req.body;
    const resolvedTransactionId = transactionId || `TXN-TEST-${Date.now()}`;

    const fee = await Fee.findByPk(feeId);
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
    
    const populated = await Fee.findByPk(fee.id, {
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });

    const student = await Student.findByPk(fee.studentId);
    if (student) {
      student.feesPaid = (student.feesPaid || 0) + paymentAmount;
      await student.save();
    }

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
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

    const populatedFee = await Fee.findByPk(fee.id, {
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
    });
    res.json(populatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    await fee.destroy();
    res.json({ message: 'Fee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await Fee.destroy({ where: { studentId } });
    res.json({ message: 'Fees deleted', deletedCount: result || 0 });
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

    const students = await Student.findAll({ 
      where: { classId },
      include: [{ model: User, as: 'user' }]
    });
    
    if (!students || students.length === 0) {
      return res.json([]);
    }

    const studentIds = students.map((student) => student.id);
    const fees = await Fee.findAll({ where: { studentId: studentIds } });

    const studentsWithFees = students.map((student) => {
      const studentId = student.id;
      const studentFees = fees.filter((fee) => fee.studentId === studentId);
      
      const totalFee = studentFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
      const totalPending = totalFee - totalPaid;

      return {
        _id: student.id,
        id: student.id,
        studentId: studentId,
        rollNumber: student.rollNumber,
        firstName: student.user?.firstName || student.firstName || '',
        lastName: student.user?.lastName || student.lastName || '',
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
