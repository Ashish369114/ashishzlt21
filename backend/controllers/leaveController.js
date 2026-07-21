const { Leave, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { role, id } = req.user;
    const isPrincipalOrAdmin = ['principal', 'super_admin'].includes(role);
    const query = isPrincipalOrAdmin ? {} : { applicantUserId: id };

    const leaves = await Leave.findAll({
      where: query,
      include: [
        { model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'userId', 'role', 'email'] },
        { model: User, as: 'reviewedBy', attributes: ['firstName', 'lastName', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(leaves);
  } catch (err) {
    console.error('leaveController.getAll error:', err);
    res.status(500).json({ message: 'Failed to fetch leave requests', error: err.message });
  }
};

exports.getPending = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'userId', 'role', 'email'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(leaves);
  } catch (err) {
    console.error('leaveController.getPending error:', err);
    res.status(500).json({ message: 'Failed to fetch pending leaves', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id, {
      include: [
        { model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'userId', 'role', 'email'] },
        { model: User, as: 'reviewedBy', attributes: ['firstName', 'lastName'] }
      ]
    });
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const isPrincipalOrAdmin = ['principal', 'super_admin'].includes(req.user.role);
    const isOwner = String(leave.applicantUserId) === String(req.user.id);
    if (!isPrincipalOrAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave', error: err.message });
  }
};

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

    const roleToApplicantRole = {
      teacher: 'teacher',
      student: 'student',
      parent: 'parent',
      principal: 'staff',
      accountant_admin: 'staff',
      super_admin: 'staff',
    };

    const leave = await Leave.create({
      applicantUserId: req.user.id,
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

    const populatedLeave = await Leave.findByPk(leave.id, {
      include: [{ model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'userId', 'role'] }]
    });

    res.status(201).json({ message: 'Leave request submitted successfully', leave: populatedLeave });
  } catch (err) {
    console.error('leaveController.create error:', err);
    res.status(500).json({ message: 'Failed to submit leave request', error: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const { remarks } = req.body;
    const leave = await Leave.findByPk(req.params.id);
    
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    
    leave.status = 'approved';
    leave.remarks = (remarks || '').trim() || 'Approved';
    leave.reviewedById = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    const populatedLeave = await Leave.findByPk(leave.id, {
      include: [{ model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'userId', 'role'] }]
    });

    res.json({ message: 'Leave approved successfully', leave: populatedLeave });
  } catch (err) {
    console.error('leaveController.approve error:', err);
    res.status(500).json({ message: 'Failed to approve leave', error: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const { remarks } = req.body;
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: 'A rejection reason (remarks) is required' });
    }

    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.status = 'rejected';
    leave.remarks = remarks.trim();
    leave.reviewedById = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    const populatedLeave = await Leave.findByPk(leave.id, {
      include: [{ model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'userId', 'role'] }]
    });

    res.json({ message: 'Leave rejected', leave: populatedLeave });
  } catch (err) {
    console.error('leaveController.reject error:', err);
    res.status(500).json({ message: 'Failed to reject leave', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const isPrincipalOrAdmin = ['principal', 'super_admin'].includes(req.user.role);
    const isOwner = String(leave.applicantUserId) === String(req.user.id);
    const isOwnPending = isOwner && leave.status === 'pending';

    if (!isPrincipalOrAdmin && !isOwnPending) {
      return res.status(403).json({
        message: 'You can only delete your own pending leave requests',
      });
    }

    await leave.destroy();
    res.json({ message: 'Leave request deleted' });
  } catch (err) {
    console.error('leaveController.remove error:', err);
    res.status(500).json({ message: 'Failed to delete leave', error: err.message });
  }
};
