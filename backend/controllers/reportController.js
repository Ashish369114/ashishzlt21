const Report = require('../models/Report');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fee = require('../models/Fee');

const generateAttendanceReport = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields: startDate, endDate' });
    }

    // Get school and user info
    let school = req.body.schoolId;
    if (!school) {
      const School = require('../models/School');
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      school = availableSchool._id;
    }

    const generatedBy = req.user?.userId || req.user?.id || req.body.generatedBy;
    if (!generatedBy) {
      return res.status(400).json({ message: 'User ID is required. Please login again.' });
    }

    const attendanceData = await Attendance.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate('student class');

    const report = new Report({
      title: `Attendance Report - ${new Date().toLocaleDateString()}`,
      reportType: 'attendance',
      school,
      generatedBy,
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
    const { classId, term } = req.body;

    // Validate required fields
    if (!term) {
      return res.status(400).json({ message: 'Missing required field: term' });
    }

    // Get school and user info
    let school = req.body.schoolId;
    if (!school) {
      const School = require('../models/School');
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      school = availableSchool._id;
    }

    const generatedBy = req.user?.userId || req.user?.id || req.body.generatedBy;
    if (!generatedBy) {
      return res.status(400).json({ message: 'User ID is required. Please login again.' });
    }

    const marksData = await Marks.find({
      class: classId,
    }).populate('student');

    const marks = marksData.map(m => m.marks);
    const report = new Report({
      title: `Academic Report - Term ${term}`,
      reportType: 'academic',
      school,
      generatedBy,
      filters: { class: classId },
      data: marksData,
      summary: {
        totalRecords: marksData.length,
        metrics: {
          averageMarks: marksData.length > 0 
            ? (marksData.reduce((sum, m) => sum + m.marks, 0) / marksData.length).toFixed(2)
            : 0,
          topScore: marks.length > 0 ? Math.max(...marks) : 0,
          lowestScore: marks.length > 0 ? Math.min(...marks) : 0,
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
    }).populate('student');

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
    const { classId } = req.body;

    // Validate required fields
    if (!classId) {
      return res.status(400).json({ message: 'Missing required field: classId' });
    }

    // Get school and user info
    let school = req.body.schoolId;
    if (!school) {
      const School = require('../models/School');
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      school = availableSchool._id;
    }

    const generatedBy = req.user?.userId || req.user?.id || req.body.generatedBy;
    if (!generatedBy) {
      return res.status(400).json({ message: 'User ID is required. Please login again.' });
    }

    const students = await Student.find({ class: classId }).populate('userId');
    const marksData = await Marks.find({ class: classId });

    const performanceData = students.map(student => {
      const studentMarks = marksData.filter(m => m.student.toString() === student._id.toString());
      const averageMarks = studentMarks.length > 0
        ? (studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length).toFixed(2)
        : 0;

      return {
        studentId: student._id,
        name: (student.userId?.firstName || '') + ' ' + (student.userId?.lastName || ''),
        averageMarks,
        totalSubjects: studentMarks.length,
      };
    });

    const report = new Report({
      title: `Performance Report - Class ${classId}`,
      reportType: 'performance',
      school,
      generatedBy,
      filters: { class: classId },
      data: performanceData,
      summary: {
        totalRecords: performanceData.length,
        metrics: performanceData.length > 0 ? {
          topPerformer: performanceData.reduce((max, p) => parseFloat(p.averageMarks) > parseFloat(max.averageMarks) ? p : max),
          classAverage: (performanceData.reduce((sum, p) => sum + parseFloat(p.averageMarks), 0) / performanceData.length).toFixed(2),
        } : {},
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
