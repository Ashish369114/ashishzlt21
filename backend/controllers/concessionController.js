const ConcessionRequest = require('../models/ConcessionRequest');
const Fee = require('../models/Fee');

exports.createRequest = async (req, res) => {
  try {
    const { studentId, feeId, concessionAmount, reason } = req.body;

    if (!studentId || !feeId || !concessionAmount || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const request = new ConcessionRequest({
      student: studentId,
      fee: feeId,
      concessionAmount: Number(concessionAmount),
      reason,
      requestedBy: req.user.userId,
    });

    await request.save();
    res.status(201).json({ message: 'Concession request submitted successfully for Principal approval!', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await ConcessionRequest.find({ status: 'pending' })
      .populate('student', 'firstName lastName userId')
      .populate('fee', 'amount description')
      .populate('requestedBy', 'firstName lastName');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ConcessionRequest.find()
      .populate('student', 'firstName lastName userId')
      .populate('fee', 'amount description')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await ConcessionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Adjust the fee details!
    const fee = await Fee.findById(request.fee);
    if (!fee) {
      return res.status(404).json({ message: 'Associated fee record not found' });
    }

    const previousAmount = fee.amount;
    fee.amount = Math.max(fee.amount - request.concessionAmount, 0);
    fee.remarks = (fee.remarks || '') + ` (Concession of ₹${request.concessionAmount} approved by Principal. Prev: ₹${previousAmount})`;
    
    // If fee paid is now >= amount, mark as paid!
    if (fee.paidAmount >= fee.amount && fee.amount > 0) {
      fee.isPaid = true;
    }

    await fee.save();

    request.status = 'approved';
    request.approvedBy = req.user.userId;
    request.approvalDate = new Date();
    request.remarks = remarks || 'Approved';

    await request.save();

    res.json({ message: 'Concession request approved and fee updated successfully!', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await ConcessionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = 'rejected';
    request.approvedBy = req.user.userId;
    request.approvalDate = new Date();
    request.remarks = remarks || 'Rejected';

    await request.save();

    res.json({ message: 'Concession request rejected.', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
