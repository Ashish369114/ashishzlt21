const { Marks, Student, Teacher, Subject, Class, User } = require('../models');

const sanitizeMarksPayload = (payload = {}) => {
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

const validateRequiredMarksFields = (payload = {}) => {
  const requiredFields = ['studentId', 'teacherId', 'subjectId', 'classId', 'marks', 'examType'];
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  return missingFields.map(f => f.replace('Id', ''));
};

const getMarks = async (req, res) => {
  try {
    const marks = await Marks.findAll({
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await Marks.findAll({ 
      where: { studentId },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarksByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const marks = await Marks.findAll({ 
      where: { classId },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMarks = async (req, res) => {
  try {
    const sanitizedPayload = sanitizeMarksPayload(req.body);
    const missingFields = validateRequiredMarksFields(sanitizedPayload);

    if (missingFields.length) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const marks = await Marks.create(sanitizedPayload);
    
    const populated = await Marks.findByPk(marks.id, {
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

const updateMarks = async (req, res) => {
  try {
    const sanitizedPayload = sanitizeMarksPayload(req.body);

    if (!sanitizedPayload || Object.keys(sanitizedPayload).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const marks = await Marks.findByPk(req.params.id);
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found' });
    }

    Object.assign(marks, sanitizedPayload);
    await marks.save();

    const populated = await Marks.findByPk(marks.id, {
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

const deleteMarks = async (req, res) => {
  try {
    const marks = await Marks.findByPk(req.params.id);
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found' });
    }
    await marks.destroy();
    res.json({ message: 'Marks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sanitizeMarksPayload,
  getMarks,
  getMarksByStudent,
  getMarksByClass,
  addMarks,
  updateMarks,
  deleteMarks,
};
