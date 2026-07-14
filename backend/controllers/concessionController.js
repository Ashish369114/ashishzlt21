const ConcessionRequest = require('../models/ConcessionRequest');
const Fee = require('../models/Fee');
const { formatCurrency } = require('../utils/currencyFormatter');

/**
 * POST /api/concessions
 * Principal grants a concession DIRECTLY — status is instantly 'approved',
 * fee is updated immediately. No pending/approval step.
 */
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

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (amount > fee.amount) {
      return res.status(400).json({ message: `Concession amount cannot exceed the current fee amount of ${formatCurrency(fee.amount)}` });
    }

    // If parent is requesting, save a pending request and DO NOT modify the fee.
    if (req.user.role === 'parent') {
      const request = new ConcessionRequest({
        student: studentId,
        fee: feeId,
        concessionAmount: amount,
        reason,
        requestedBy: req.user.userId,
        status: 'pending',
      });
      await request.save();
      return res.status(201).json({
        message: `Your concession request of ${formatCurrency(amount)} has been submitted to the Principal for approval.`,
        request,
      });
    }

    // Otherwise (Principal, Super Admin, Accountant direct grant), apply immediately.
    const previousAmount = fee.amount;
    fee.amount = Math.max(fee.amount - amount, 0);
    fee.remarks = `${fee.remarks || ''} [Concession ${formatCurrency(amount)} granted by Principal. Prev: ${formatCurrency(previousAmount)}]`.trim();

    if (fee.amount === 0 || (fee.paidAmount >= fee.amount && fee.amount > 0)) {
      fee.isPaid = true;
    }
    await fee.save();

    const request = new ConcessionRequest({
      student: studentId,
      fee: feeId,
      concessionAmount: amount,
      reason,
      requestedBy: req.user.userId,
      status: 'approved',
      approvedBy: req.user.userId,
      approvalDate: new Date(),
      remarks: `Directly granted by ${req.user.firstName || 'Principal'}`,
    });

    await request.save();
    res.status(201).json({
      message: `Concession of ${formatCurrency(amount)} granted. Fee updated from ${formatCurrency(previousAmount)} → ${formatCurrency(fee.amount)}`,
      request,
    });
  } catch (error) {
    console.error('concessionController.createRequest error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/concessions/pending
 * Returns all concessions (all are now auto-approved; kept for compatibility)
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await ConcessionRequest.find({ status: 'pending' })
      .populate('student', 'firstName lastName userId')
      .populate('fee', 'amount description')
      .populate('requestedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/concessions
 * All concessions — used by both Principal (grant page) and Accountant (log view)
 */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ConcessionRequest.find()
      .populate('student', 'firstName lastName userId')
      .populate('fee', 'amount description dueDate')
      .populate('requestedBy', 'firstName lastName role')
      .populate('approvedBy', 'firstName lastName role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/concessions/:id/approve  — kept for backward compatibility (no-op if already approved)
 */
exports.approveRequest = async (req, res) => {
  try {
    const request = await ConcessionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Concession record not found' });

    if (request.status === 'approved') {
      return res.json({ message: 'Concession is already approved.', request });
    }

    if (request.status === 'rejected') {
      return res.status(400).json({ message: 'Concession request was already rejected.' });
    }

    // Process approval
    const fee = await Fee.findById(request.fee);
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
    request.approvedBy = req.user.userId;
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

/**
 * PUT /api/concessions/:id/reject  — Principal can reject/revoke a concession request
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { remarks } = req.body;
    const request = await ConcessionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Concession record not found' });

    if (request.status === 'rejected') {
      return res.json({ message: 'Concession is already rejected.', request });
    }

    // If it was already approved, restore the fee amount
    if (request.status === 'approved') {
      const fee = await Fee.findById(request.fee);
      if (fee) {
        fee.amount = fee.amount + request.concessionAmount;
        fee.isPaid = fee.paidAmount >= fee.amount;
        fee.remarks = `${fee.remarks || ''} [Concession of ${formatCurrency(request.concessionAmount)} revoked]`.trim();
        await fee.save();
      }
    }

    // Mark as rejected
    request.status = 'rejected';
    request.remarks = remarks || 'Rejected by Principal';
    await request.save();

    res.json({ message: 'Concession request rejected.', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
