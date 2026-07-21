const { Attendance, Student, Class } = require('../models');

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      include: [
        { model: Student, as: 'student' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const attendance = await Attendance.findAll({ 
      where: { studentId },
      include: [
        { model: Student, as: 'student' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const attendance = await Attendance.findAll({ 
      where: { classId },
      include: [
        { model: Student, as: 'student' },
        { model: Class, as: 'class' }
      ]
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { student, class: classId, date, status, remarks } = req.body;
    
    // Normalize date to start of day to prevent time-based duplicates
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const [attendance] = await Attendance.upsert(
      { 
        studentId: student, 
        classId: classId, 
        date: queryDate,
        status, 
        remarks 
      },
      { returning: true }
    );
    
    const populatedAttendance = await Attendance.findByPk(attendance.id, {
      include: [
        { model: Student, as: 'student' },
        { model: Class, as: 'class' }
      ]
    });

    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    Object.assign(attendance, req.body);
    await attendance.save();

    const populatedAttendance = await Attendance.findByPk(attendance.id, {
      include: [
        { model: Student, as: 'student' },
        { model: Class, as: 'class' }
      ]
    });

    res.json(populatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    await attendance.destroy();
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendance,
  getAttendanceByStudent,
  getAttendanceByClass,
  markAttendance,
  updateAttendance,
  deleteAttendance,
};
