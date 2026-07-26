const express = require('express');
const router = express.Router();
const { AuditLog } = require('../models');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const { Op } = require('sequelize');

// GET /api/audit-logs (with search, filtering, pagination)
router.get('/', auth, roleMiddleware(['super_admin', 'principal']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', action = '', resource = '', role = '' } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { action: { [Op.like]: `%${search}%` } },
        { resource: { [Op.like]: `%${search}%` } },
        { details: { [Op.like]: `%${search}%` } },
      ];
    }

    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (role) where.userRole = role;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      logs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
});

// GET /api/audit-logs/export (Export all audit logs)
router.get('/export', auth, roleMiddleware(['super_admin', 'principal']), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 1000,
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
