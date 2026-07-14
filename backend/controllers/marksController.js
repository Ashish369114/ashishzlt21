const Marks = require('../models/Marks');

const sanitizeMarksPayload = (payload = {}) => {
  const sanitized = { ...payload };
  const objectIdFields = ['student', 'teacher', 'subject', 'class'];

  objectIdFields.forEach((field) => {
    const value = sanitized[field];
    if (typeof value === 'string' && value.trim() === '') {
      delete sanitized[field];
    }
  });

  return sanitized;
};

const validateRequiredMarksFields = (payload = {}) => {
  const requiredFields = ['student', 'teacher', 'subject', 'class', 'marks', 'examType'];
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  return missingFields;
};

const getMarks = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await Marks.find({ student: studentId })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarksByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const marks = await Marks.find({ class: classId })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
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

    const marks = new Marks(sanitizedPayload);
    await marks.save();
    await marks.populate('student');
    await marks.populate('teacher subject class');
    res.status(201).json(marks);
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

    const marks = await Marks.findByIdAndUpdate(req.params.id, sanitizedPayload, { new: true })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMarks = async (req, res) => {
  try {
    const marks = await Marks.findByIdAndDelete(req.params.id);
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found' });
    }
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
