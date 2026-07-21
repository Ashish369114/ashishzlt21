const { Remark, Student, Teacher, Subject, Class, User } = require('../models');

const sanitizeRemarkPayload = (payload) => {
  const sanitized = { ...payload };
  const fieldMapping = {
    'student': 'studentId',
    'teacher': 'teacherId',
    'subject': 'subjectId',
    'class': 'classId'
  };

  Object.keys(fieldMapping).forEach((field) => {
    const value = sanitized[field];
    if (value !== undefined) {
      if (typeof value !== 'string' || value.trim() !== '') {
        sanitized[fieldMapping[field]] = value;
      }
      delete sanitized[field];
    }
  });

  return sanitized;
};

const getRemarks = async (req, res) => {
  try {
    const remarks = await Remark.findAll({
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRemarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const remarks = await Remark.findAll({ 
      where: { studentId },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRemarksByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const remarks = await Remark.findAll({ 
      where: { classId },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addRemark = async (req, res) => {
  try {
    const payload = sanitizeRemarkPayload(req.body);
    const remark = await Remark.create(payload);

    const populated = await Remark.findByPk(remark.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRemark = async (req, res) => {
  try {
    const payload = sanitizeRemarkPayload(req.body);
    const remark = await Remark.findByPk(req.params.id);
    
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }

    Object.assign(remark, payload);
    await remark.save();

    const populated = await Remark.findByPk(remark.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRemark = async (req, res) => {
  try {
    const remark = await Remark.findByPk(req.params.id);
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }
    await remark.destroy();
    res.json({ message: 'Remark deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRemarks,
  getRemarksByStudent,
  getRemarksByClass,
  addRemark,
  updateRemark,
  deleteRemark,
};
