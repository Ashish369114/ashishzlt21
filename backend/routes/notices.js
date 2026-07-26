const express = require('express');
const router = express.Router();
const { Notice } = require('../models');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditLogger = require('../middleware/auditLogger');
const { Op } = require('sequelize');

// GET /api/notices (List with search, audience, & category filter)
router.get('/', auth, async (req, res) => {
  try {
    const { search = '', targetAudience = '', category = '', priority = '', page = 1, limit = 20 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { publishedBy: { [Op.like]: `%${search}%` } },
      ];
    }

    if (targetAudience) where.targetAudience = targetAudience;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notice.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['publishDate', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      notices: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notices (Create Notice)
router.post('/', auth, roleMiddleware(['super_admin', 'principal']), auditLogger('CREATE', 'Notice'), async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      publishedBy: req.body.publishedBy || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.userId,
      schoolId: req.user.school || null,
    });
    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/notices/:id (Update Notice)
router.put('/:id', auth, roleMiddleware(['super_admin', 'principal']), auditLogger('UPDATE', 'Notice'), async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    await notice.update(req.body);
    res.json({ success: true, notice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/notices/:id (Delete Notice)
router.delete('/:id', auth, roleMiddleware(['super_admin', 'principal']), auditLogger('DELETE', 'Notice'), async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    await notice.destroy();
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
