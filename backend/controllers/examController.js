const Exam = require('../models/Exam');

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('class')
      .populate('subject')
      .populate({
        path: 'invigilator',
        populate: { path: 'userId' }
      });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('class')
      .populate('subject')
      .populate({
        path: 'invigilator',
        populate: { path: 'userId' }
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
    const exams = await Exam.find({ class: classId })
      .populate('class')
      .populate('subject')
      .populate({
        path: 'invigilator',
        populate: { path: 'userId' }
      });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();

    const populatedExam = await Exam.findById(exam._id);
    await populatedExam.populate('class');
    await populatedExam.populate('subject');
    await populatedExam.populate({
      path: 'invigilator',
      populate: { path: 'userId' }
    });

    res.status(201).json(populatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('class')
      .populate('subject')
      .populate({
        path: 'invigilator',
        populate: { path: 'userId' }
      });
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
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
