const ConcessionRequest = require('../models/ConcessionRequest');
const Fee = require('../models/Fee');

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

    // Update the fee immediately
    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const previousAmount = fee.amount;
    fee.amount = Math.max(fee.amount - amount, 0);
    fee.remarks = `${fee.remarks || ''} [Concession ₹${amount} granted by Principal. Prev: ₹${previousAmount}]`.trim();

    // Auto-mark paid if fully covered
    if (fee.amount === 0 || (fee.paidAmount >= fee.amount && fee.amount > 0)) {
      fee.isPaid = true;
    }
    await fee.save();

    // Record in concession log — already approved
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
      message: `Concession of ₹${amount} granted. Fee updated from ₹${previousAmount} → ₹${fee.amount}`,
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
    const requests = await ConcessionRequest.find()
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
    res.json({ message: 'Concession is already approved (direct grant system).', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/concessions/:id/reject  — Principal can revoke a granted concession
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { remarks } = req.body;
    const request = await ConcessionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Concession record not found' });

    if (request.status === 'approved') {
      // Restore the fee amount
      const fee = await Fee.findById(request.fee);
      if (fee) {
        fee.amount = fee.amount + request.concessionAmount;
        fee.isPaid = fee.paidAmount >= fee.amount;
        fee.remarks = `${fee.remarks || ''} [Concession of ₹${request.concessionAmount} revoked]`.trim();
        await fee.save();
      }
    }

    request.status = 'rejected';
    request.remarks = remarks || 'Revoked by Principal';
    await request.save();

    res.json({ message: 'Concession revoked and fee restored.', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
