const Report = require('../models/Report');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fee = require('../models/Fee');

const generateAttendanceReport = async (req, res) => {
  try {
    const { schoolId, classId, startDate, endDate } = req.body;

    const attendanceData = await Attendance.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate('studentId classId');

    const report = new Report({
      title: `Attendance Report - ${new Date().toLocaleDateString()}`,
      reportType: 'attendance',
      school: schoolId,
      generatedBy: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      filters: { class: classId },
      data: attendanceData,
      summary: {
        totalRecords: attendanceData.length,
        metrics: {
          present: attendanceData.filter(a => a.status === 'present').length,
          absent: attendanceData.filter(a => a.status === 'absent').length,
          leave: attendanceData.filter(a => a.status === 'leave').length,
        },
      },
      format: req.body.format || 'pdf',
      status: 'completed',
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateAcademicReport = async (req, res) => {
  try {
    const { schoolId, classId, term } = req.body;

    const marksData = await Marks.find({
      classId,
    }).populate('studentId');

    const report = new Report({
      title: `Academic Report - Term ${term}`,
      reportType: 'academic',
      school: schoolId,
      generatedBy: req.user.id,
      filters: { class: classId },
      data: marksData,
      summary: {
        totalRecords: marksData.length,
        metrics: {
          averageMarks: marksData.length > 0 
            ? (marksData.reduce((sum, m) => sum + m.marksObtained, 0) / marksData.length).toFixed(2)
            : 0,
          topScore: Math.max(...marksData.map(m => m.marksObtained)),
          lowestScore: Math.min(...marksData.map(m => m.marksObtained)),
        },
      },
      format: req.body.format || 'pdf',
      status: 'completed',
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateFinancialReport = async (req, res) => {
  try {
    const { schoolId, startDate, endDate } = req.body;

    const feeData = await Fee.find({
      school: schoolId,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate('studentId');

    const totalCollected = feeData.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
    const totalPending = feeData.reduce((sum, f) => sum + (f.amountPending || 0), 0);

    const report = new Report({
      title: `Financial Report - ${new Date().toLocaleDateString()}`,
      reportType: 'financial',
      school: schoolId,
      generatedBy: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      data: feeData,
      summary: {
        totalRecords: feeData.length,
        metrics: {
          totalCollected,
          totalPending,
          collectionRate: feeData.length > 0 
            ? ((totalCollected / (totalCollected + totalPending)) * 100).toFixed(2) + '%'
            : '0%',
        },
      },
      format: req.body.format || 'pdf',
      status: 'completed',
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generatePerformanceReport = async (req, res) => {
  try {
    const { schoolId, classId } = req.body;

    const students = await Student.find({ class: classId }).populate('userId');
    const marksData = await Marks.find({ classId });

    const performanceData = students.map(student => {
      const studentMarks = marksData.filter(m => m.studentId.toString() === student._id.toString());
      const averageMarks = studentMarks.length > 0
        ? (studentMarks.reduce((sum, m) => sum + m.marksObtained, 0) / studentMarks.length).toFixed(2)
        : 0;

      return {
        studentId: student._id,
        name: student.userId.firstName + ' ' + student.userId.lastName,
        averageMarks,
        totalSubjects: studentMarks.length,
      };
    });

    const report = new Report({
      title: `Performance Report - Class ${classId}`,
      reportType: 'performance',
      school: schoolId,
      generatedBy: req.user.id,
      filters: { class: classId },
      data: performanceData,
      summary: {
        totalRecords: performanceData.length,
        metrics: {
          topPerformer: performanceData.reduce((max, p) => parseFloat(p.averageMarks) > parseFloat(max.averageMarks) ? p : max),
          classAverage: (performanceData.reduce((sum, p) => sum + parseFloat(p.averageMarks), 0) / performanceData.length).toFixed(2),
        },
      },
      format: req.body.format || 'pdf',
      status: 'completed',
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('school')
      .populate('generatedBy');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('school')
      .populate('generatedBy');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      reportType: req.body.reportType,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      format: req.body.format,
      visibility: req.body.visibility,
    };

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    const report = await Report.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scheduleReport = async (req, res) => {
  try {
    const report = new Report({
      title: req.body.title,
      reportType: req.body.reportType,
      school: req.body.schoolId,
      generatedBy: req.user.id,
      scheduledGeneration: {
        isScheduled: true,
        frequency: req.body.frequency,
        nextGenerationDate: new Date(req.body.nextGenerationDate),
      },
      status: 'pending',
    });

    await report.save();
    res.status(201).json({ message: 'Report scheduled successfully', report });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReportsBySchool = async (req, res) => {
  try {
    const reports = await Report.find({ school: req.params.schoolId })
      .populate('generatedBy');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateAttendanceReport,
  generateAcademicReport,
  generateFinancialReport,
  generatePerformanceReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  scheduleReport,
  getReportsBySchool,
};
