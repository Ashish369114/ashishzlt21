const School = require('../models/School');

const getSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .populate('principalId')
      .exec();
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('principalId');
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSchool = async (req, res) => {
  const school = new School(req.body);
  try {
    const newSchool = await school.save();
    res.status(201).json(newSchool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    Object.assign(school, req.body);
    const updatedSchool = await school.save();
    res.json(updatedSchool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchoolStatistics = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const school = await School.findById(schoolId);
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const stats = {
      schoolName: school.name,
      totalStudents: school.totalStudents,
      totalTeachers: school.totalTeachers,
      totalClasses: school.totalClasses,
      academicYear: school.academicYear,
      status: school.status,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchools,
  getSchoolById,
  addSchool,
  updateSchool,
  deleteSchool,
  getSchoolStatistics,
};
