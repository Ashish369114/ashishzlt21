const express = require('express');
const router = express.Router();
const { LessonPlan } = require('../models');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditLogger = require('../middleware/auditLogger');
const { Op } = require('sequelize');

// GET /api/lesson-plans (List with search, status, class, & subject filter)
router.get('/', auth, async (req, res) => {
  try {
    const { search = '', status = '', className = '', subject = '', page = 1, limit = 20 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { teacherName: { [Op.like]: `%${search}%` } },
        { topicsCovered: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (className) where.className = className;
    if (subject) where.subject = subject;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await LessonPlan.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      lessonPlans: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/lesson-plans (Create Lesson Plan)
router.post('/', auth, roleMiddleware(['super_admin', 'principal', 'teacher']), auditLogger('CREATE', 'Lesson Plan'), async (req, res) => {
  try {
    const lessonPlan = await LessonPlan.create({
      ...req.body,
      teacherName: req.body.teacherName || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.userId,
      teacherId: req.user.userId,
      status: 'pending',
      schoolId: req.user.school || null,
    });
    res.status(201).json({ success: true, lessonPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/lesson-plans/:id (Update Lesson Plan)
router.put('/:id', auth, auditLogger('UPDATE', 'Lesson Plan'), async (req, res) => {
  try {
    const plan = await LessonPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Lesson plan not found' });

    await plan.update(req.body);
    res.json({ success: true, lessonPlan: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/lesson-plans/:id/approve (Principal Approval Workflow)
router.patch('/:id/approve', auth, roleMiddleware(['super_admin', 'principal']), auditLogger('APPROVAL', 'Lesson Plan'), async (req, res) => {
  try {
    const { status, principalComments } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const plan = await LessonPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Lesson plan not found' });

    await plan.update({
      status,
      principalComments: principalComments || plan.principalComments,
      reviewedDate: new Date(),
    });

    res.json({ success: true, message: `Lesson plan status updated to ${status}`, lessonPlan: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/lesson-plans/:id (Delete Lesson Plan)
router.delete('/:id', auth, roleMiddleware(['super_admin', 'principal']), auditLogger('DELETE', 'Lesson Plan'), async (req, res) => {
  try {
    const plan = await LessonPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Lesson plan not found' });

    await plan.destroy();
    res.json({ success: true, message: 'Lesson plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
