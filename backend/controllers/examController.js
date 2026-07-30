const { Exam, Class, Subject, Teacher, User } = require('../models');

const getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { 
          model: Teacher, 
          as: 'invigilator',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
        }
      ]
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { 
          model: Teacher, 
          as: 'invigilator',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
        }
      ]
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExamsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const exams = await Exam.findAll({ 
      where: { classId },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { 
          model: Teacher, 
          as: 'invigilator',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
        }
      ]
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sanitizeExamBody = async (body) => {
  const payload = { ...body };
  if (payload.class) {
    payload.classId = payload.class;
    delete payload.class;
  }
  if (payload.subject) {
    if (isNaN(payload.subject)) {
      const [subjObj] = await Subject.findOrCreate({
        where: { name: String(payload.subject) },
        defaults: { name: String(payload.subject), code: String(payload.subject).substring(0, 4).toUpperCase() }
      });
      payload.subjectId = subjObj.id;
    } else {
      payload.subjectId = Number(payload.subject);
    }
    delete payload.subject;
  }
  if (payload.invigilator) {
    payload.invigilatorId = payload.invigilator;
    delete payload.invigilator;
  }
  return payload;
};

const addExam = async (req, res) => {
  try {
    const payload = await sanitizeExamBody(req.body);
    const exam = await Exam.create(payload);

    const populatedExam = await Exam.findByPk(exam.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { 
          model: Teacher, 
          as: 'invigilator',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
        }
      ]
    });

    res.status(201).json(populatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const payload = await sanitizeExamBody(req.body);
    const exam = await Exam.findByPk(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    Object.assign(exam, payload);
    await exam.save();

    const populatedExam = await Exam.findByPk(exam.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { 
          model: Teacher, 
          as: 'invigilator',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
        }
      ]
    });

    res.json(populatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    await exam.destroy();
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExams,
  getExamById,
  getExamsByClass,
  addExam,
  updateExam,
  deleteExam,
};
