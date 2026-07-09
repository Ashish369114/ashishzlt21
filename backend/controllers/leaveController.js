const Leave = require('../models/Leave');

/**
 * GET /api/leaves
 * - Principal / Super Admin → sees ALL leave requests
 * - Teacher / Student / Parent → sees only their own
 */
exports.getAll = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const isPrincipalOrAdmin = ['principal', 'super_admin'].includes(role);
    const query = isPrincipalOrAdmin ? {} : { applicant: userId };

    const leaves = await Leave.find(query)
      .populate('applicant', 'firstName lastName userId role email')
      .populate('reviewedBy', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('leaveController.getAll error:', err);
    res.status(500).json({ message: 'Failed to fetch leave requests', error: err.message });
  }
};

/**
 * GET /api/leaves/pending
 * Principal / Super Admin only — returns all pending requests
 */
exports.getPending = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' })
      .populate('applicant', 'firstName lastName userId role email')
      .sort({ createdAt: 1 }); // oldest first for priority
    res.json(leaves);
  } catch (err) {
    console.error('leaveController.getPending error:', err);
    res.status(500).json({ message: 'Failed to fetch pending leaves', error: err.message });
  }
};

/**
 * GET /api/leaves/:id
 * Any authenticated user (controller guards own vs others)
 */
exports.getById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('applicant', 'firstName lastName userId role email')
      .populate('reviewedBy', 'firstName lastName');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const isPrincipalOrAdmin = ['principal', 'super_admin'].includes(req.user.role);
    const isOwner = String(leave.applicant?._id) === String(req.user.userId);
    if (!isPrincipalOrAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave', error: err.message });
  }
};

/**
 * POST /api/leaves
 * Any authenticated user submits a leave for themselves.
 * Applicant details auto-filled from JWT; manual overrides allowed for admins.
 */
exports.create = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: 'leaveType, fromDate, toDate, and reason are required',
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) {
      return res.status(400).json({ message: 'toDate must be on or after fromDate' });
    }

    // Map role to applicantRole enum value
    const roleToApplicantRole = {
      teacher: 'teacher',
      student: 'student',
      parent: 'parent',
      principal: 'staff',
      accountant_admin: 'staff',
      super_admin: 'staff',
    };

    const leave = new Leave({
      applicant: req.user.userId,
      applicantRole: roleToApplicantRole[req.user.role] || 'staff',
      applicantName: req.user.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`.trim()
        : req.user.userId,
      applicantId: req.user.userStringId || req.user.userId,
      leaveType,
      fromDate: from,
      toDate: to,
      reason: reason.trim(),
    });

    await leave.save();
    await leave.populate('applicant', 'firstName lastName userId role');
    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (err) {
    console.error('leaveController.create error:', err);
    res.status(500).json({ message: 'Failed to submit leave request', error: err.message });
  }
};

/**
 * PUT /api/leaves/:id/approve
 * Principal / Super Admin only
 */
exports.approve = async (req, res) => {
  try {
    const { remarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        remarks: (remarks || '').trim() || 'Approved',
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('applicant', 'firstName lastName userId role');

    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json({ message: 'Leave approved successfully', leave });
  } catch (err) {
    console.error('leaveController.approve error:', err);
    res.status(500).json({ message: 'Failed to approve leave', error: err.message });
  }
};

/**
 * PUT /api/leaves/:id/reject
 * Principal / Super Admin only
 */
exports.reject = async (req, res) => {
  try {
    const { remarks } = req.body;
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: 'A rejection reason (remarks) is required' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        remarks: remarks.trim(),
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('applicant', 'firstName lastName userId role');

    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json({ message: 'Leave rejected', leave });
  } catch (err) {
    console.error('leaveController.reject error:', err);
    res.status(500).json({ message: 'Failed to reject leave', error: err.message });
  }
};

/**
 * DELETE /api/leaves/:id
 * Principal / Super Admin — can delete any; others can only delete their own pending requests
 */
exports.remove = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const isPrincipalOrAdmin = ['principal', 'super_admin'].includes(req.user.role);
    const isOwner = String(leave.applicant) === String(req.user.userId);
    const isOwnPending = isOwner && leave.status === 'pending';

    if (!isPrincipalOrAdmin && !isOwnPending) {
      return res.status(403).json({
        message: 'You can only delete your own pending leave requests',
      });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted' });
  } catch (err) {
    console.error('leaveController.remove error:', err);
    res.status(500).json({ message: 'Failed to delete leave', error: err.message });
  }
};
