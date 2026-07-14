const Attendance = require('../models/Attendance');

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('student')
      .populate('class');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const attendance = await Attendance.find({ student: studentId })
      .populate('student')
      .populate('class');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const attendance = await Attendance.find({ class: classId })
      .populate('student')
      .populate('class');
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

    const attendance = await Attendance.findOneAndUpdate(
      { student, class: classId, date: queryDate },
      { $set: { status, remarks } },
      { new: true, upsert: true }
    ).populate('student class');
    
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student')
      .populate('class');
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
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
