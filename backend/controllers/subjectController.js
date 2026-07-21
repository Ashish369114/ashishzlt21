const { Subject } = require('../models');

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Subject name is required.' });
    }

    const existing = await Subject.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Subject already exists.' });
    }

    const subject = await Subject.create({ name, code, description });
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, code, description } = req.body;
    if (name) subject.name = name;
    if (code !== undefined) subject.code = code;
    if (description !== undefined) subject.description = description;

    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    await subject.destroy();
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
};
