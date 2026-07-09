const Remark = require('../models/Remark');

const getRemarks = async (req, res) => {
  try {
    const remarks = await Remark.find()
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRemarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const remarks = await Remark.find({ student: studentId })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRemarksByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const remarks = await Remark.find({ class: classId })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addRemark = async (req, res) => {
  try {
    const remark = new Remark(req.body);
    await remark.save();

    const populated = await Remark.findById(remark._id)
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRemark = async (req, res) => {
  try {
    const remark = await Remark.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(remark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRemark = async (req, res) => {
  try {
    const remark = await Remark.findByIdAndDelete(req.params.id);
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }
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
