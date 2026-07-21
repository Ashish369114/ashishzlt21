const { ConcessionRequest, Fee, Student, User } = require('../models');
const { formatCurrency } = require('../utils/currencyFormatter');

exports.createRequest = async (req, res) => {
  try {
    const { studentId, feeId, concessionAmount, reason } = req.body;

    if (!studentId || !feeId || !concessionAmount || !reason) {
      return res.status(400).json({ message: 'studentId, feeId, concessionAmount and reason are required' });
    }

    const amount = Number(concessionAmount);
    if (amount <= 0) {
      return res.status(400).json({ message: 'Concession amount must be greater than 0' });
    }

    const fee = await Fee.findByPk(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (amount > fee.amount) {
      return res.status(400).json({ message: `Concession amount cannot exceed the current fee amount of ${formatCurrency(fee.amount)}` });
    }

    if (req.user.role === 'parent') {
      const request = await ConcessionRequest.create({
        studentId,
        feeId,
        concessionAmount: amount,
        reason,
        requestedById: req.user.id,
        status: 'pending',
      });
      return res.status(201).json({
        message: `Your concession request of ${formatCurrency(amount)} has been submitted to the Principal for approval.`,
        request,
      });
    }

    const previousAmount = fee.amount;
    fee.amount = Math.max(fee.amount - amount, 0);
    fee.remarks = `${fee.remarks || ''} [Concession ${formatCurrency(amount)} granted by Principal. Prev: ${formatCurrency(previousAmount)}]`.trim();

    if (fee.amount === 0 || (fee.paidAmount >= fee.amount && fee.amount > 0)) {
      fee.isPaid = true;
    }
    await fee.save();

    const request = await ConcessionRequest.create({
      studentId,
      feeId,
      concessionAmount: amount,
      reason,
      requestedById: req.user.id,
      status: 'approved',
      approvedById: req.user.id,
      approvalDate: new Date(),
      remarks: `Directly granted by ${req.user.firstName || 'Principal'}`,
    });

    res.status(201).json({
      message: `Concession of ${formatCurrency(amount)} granted. Fee updated from ${formatCurrency(previousAmount)} → ${formatCurrency(fee.amount)}`,
      request,
    });
  } catch (error) {
    console.error('concessionController.createRequest error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await ConcessionRequest.findAll({ 
      where: { status: 'pending' },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userId'] }] },
        { model: Fee, as: 'fee', attributes: ['amount', 'description'] },
        { model: User, as: 'requestedBy', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ConcessionRequest.findAll({
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userId'] }] },
        { model: Fee, as: 'fee', attributes: ['amount', 'description', 'dueDate'] },
        { model: User, as: 'requestedBy', attributes: ['firstName', 'lastName', 'role'] },
        { model: User, as: 'approvedBy', attributes: ['firstName', 'lastName', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await ConcessionRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Concession record not found' });

    if (request.status === 'approved') {
      return res.json({ message: 'Concession is already approved.', request });
    }

    if (request.status === 'rejected') {
      return res.status(400).json({ message: 'Concession request was already rejected.' });
    }

    const fee = await Fee.findByPk(request.feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Associated fee record not found' });
    }

    const previousAmount = fee.amount;
    fee.amount = Math.max(fee.amount - request.concessionAmount, 0);
    fee.remarks = `${fee.remarks || ''} [Concession ${formatCurrency(request.concessionAmount)} approved by Principal. Prev: ${formatCurrency(previousAmount)}]`.trim();

    if (fee.amount === 0 || (fee.paidAmount >= fee.amount && fee.amount > 0)) {
      fee.isPaid = true;
    }
    await fee.save();

    request.status = 'approved';
    request.approvedById = req.user.id;
    request.approvalDate = new Date();
    request.remarks = req.body.remarks || 'Approved by Principal';
    await request.save();

    res.json({
      message: `Concession of ${formatCurrency(request.concessionAmount)} approved and applied to fee.`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { remarks } = req.body;
    const request = await ConcessionRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Concession record not found' });

    if (request.status === 'rejected') {
      return res.json({ message: 'Concession is already rejected.', request });
    }

    if (request.status === 'approved') {
      const fee = await Fee.findByPk(request.feeId);
      if (fee) {
        fee.amount = fee.amount + request.concessionAmount;
        fee.isPaid = fee.paidAmount >= fee.amount;
        fee.remarks = `${fee.remarks || ''} [Concession of ${formatCurrency(request.concessionAmount)} revoked]`.trim();
        await fee.save();
      }
    }

    request.status = 'rejected';
    request.remarks = remarks || 'Rejected by Principal';
    await request.save();

    res.json({ message: 'Concession request rejected.', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
