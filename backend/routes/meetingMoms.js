const express = require('express');
const router = express.Router();
const { MeetingMom } = require('../models');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditLogger = require('../middleware/auditLogger');
const { Op } = require('sequelize');

// GET /api/meeting-moms (List with search & filter)
router.get('/', auth, async (req, res) => {
  try {
    const { search = '', meetingType = '', page = 1, limit = 20 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { agenda: { [Op.like]: `%${search}%` } },
        { keyDecisions: { [Op.like]: `%${search}%` } },
        { organizer: { [Op.like]: `%${search}%` } },
      ];
    }

    if (meetingType) where.meetingType = meetingType;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await MeetingMom.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['meetingDate', 'DESC']],
    });

    res.json({
      success: true,
      moms: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/meeting-moms (Create MOM)
router.post('/', auth, roleMiddleware(['super_admin', 'principal', 'teacher']), auditLogger('CREATE', 'Meeting MOM'), async (req, res) => {
  try {
    const mom = await MeetingMom.create({
      ...req.body,
      organizer: req.body.organizer || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.userId,
      schoolId: req.user.school || null,
    });
    res.status(21).json({ success: true, mom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/meeting-moms/:id (Update MOM)
router.put('/:id', auth, roleMiddleware(['super_admin', 'principal', 'teacher']), auditLogger('UPDATE', 'Meeting MOM'), async (req, res) => {
  try {
    const mom = await MeetingMom.findByPk(req.params.id);
    if (!mom) return res.status(404).json({ success: false, message: 'Meeting MOM not found' });

    await mom.update(req.body);
    res.json({ success: true, mom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/meeting-moms/:id (Delete MOM)
router.delete('/:id', auth, roleMiddleware(['super_admin', 'principal']), auditLogger('DELETE', 'Meeting MOM'), async (req, res) => {
  try {
    const mom = await MeetingMom.findByPk(req.params.id);
    if (!mom) return res.status(404).json({ success: false, message: 'Meeting MOM not found' });

    await mom.destroy();
    res.json({ success: true, message: 'Meeting MOM deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
