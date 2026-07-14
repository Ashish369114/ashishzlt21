const Report = require('../models/Report');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fee = require('../models/Fee');

const generateAttendanceReport = async (req, res) => {
  try {
    const { classId, studentId, startDate, endDate } = req.body;

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

    let queryStudentId = studentId;
    if (studentId) {
      const studentDoc = await Student.findById(studentId);
      if (studentDoc) {
        queryStudentId = studentDoc.userId;
      }
    }

    const attendanceQuery = {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (studentId) {
      attendanceQuery.student = queryStudentId;
    } else if (classId) {
      attendanceQuery.class = classId;
    }

    const attendanceData = await Attendance.find(attendanceQuery)
      .populate('student')
      .populate('class');

    const filters = {};
    if (classId) filters.class = classId;
    if (studentId) filters.student = studentId;

    let reportTitle = `Attendance Report - ${new Date().toLocaleString()}`;
    if (studentId) {
      const student = await Student.findById(studentId).populate('userId');
      if (student) {
        reportTitle = `Attendance Report - ${student.userId?.firstName || ''} ${student.userId?.lastName || ''} (${new Date().toLocaleString()})`;
      }
    } else if (classId) {
      const Class = require('../models/Class');
      const cls = await Class.findById(classId);
      if (cls) {
        reportTitle = `Attendance Report - Grade ${cls.grade} Section ${cls.section} (${new Date().toLocaleString()})`;
      }
    }

    const report = new Report({
      title: reportTitle,
      reportType: 'attendance',
      school,
      generatedBy,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      filters,
      data: attendanceData.map(d => d.toJSON()),
      summary: {
        totalRecords: attendanceData.length,
        metrics: {
          present: attendanceData.filter(a => String(a.status).toLowerCase() === 'present').length,
          absent: attendanceData.filter(a => String(a.status).toLowerCase() === 'absent').length,
          leave: attendanceData.filter(a => String(a.status).toLowerCase() === 'leave').length,
        },
      },
      format: req.body.format || 'pdf',
      status: 'completed',
    });

    // Set fileUrl
    report.fileUrl = `/api/reports/download/${report._id}`;
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateAcademicReport = async (req, res) => {
  try {
    const { classId, studentId, term } = req.body;

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

    let queryStudentId = studentId;
    if (studentId) {
      const studentDoc = await Student.findById(studentId);
      if (studentDoc) {
        queryStudentId = studentDoc.userId;
      }
    }

    const marksQuery = {};
    if (studentId) {
      marksQuery.student = queryStudentId;
    } else if (classId) {
      marksQuery.class = classId;
    }
    if (term) {
      marksQuery.examType = term;
    }

    const marksData = await Marks.find(marksQuery)
      .populate('student')
      .populate('class')
      .populate('subject');

    const marks = marksData.map(m => m.marks);
    const filters = {};
    if (classId) filters.class = classId;
    if (studentId) filters.student = studentId;

    let reportTitle = `Academic Report - Term ${term} (${new Date().toLocaleString()})`;
    if (studentId) {
      const student = await Student.findById(studentId).populate('userId');
      if (student) {
        reportTitle = `Academic Report - Term ${term} - ${student.userId?.firstName || ''} ${student.userId?.lastName || ''} (${new Date().toLocaleString()})`;
      }
    } else if (classId) {
      const Class = require('../models/Class');
      const cls = await Class.findById(classId);
      if (cls) {
        reportTitle = `Academic Report - Term ${term} - Grade ${cls.grade} Section ${cls.section} (${new Date().toLocaleString()})`;
      }
    }

    const report = new Report({
      title: reportTitle,
      reportType: 'academic',
      school,
      generatedBy,
      filters,
      data: marksData.map(m => m.toJSON()),
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

    report.fileUrl = `/api/reports/download/${report._id}`;
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    let schoolId = req.body.schoolId;

    if (!schoolId) {
      const School = require('../models/School');
      const availableSchool = await School.findOne();
      if (availableSchool) {
        schoolId = availableSchool._id;
      }
    }

    const query = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (schoolId) {
      query.school = schoolId;
    }

    const feeData = await Fee.find(query).populate('student');

    const totalCollected = feeData.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const totalPending = feeData.reduce((sum, f) => sum + Math.max(0, (f.amount || 0) - (f.paidAmount || 0)), 0);

    const pocketMoneyData = feeData.filter(f => /pocket/i.test(f.description || ''));
    const cautionDepositData = feeData.filter(f => /caution/i.test(f.description || ''));
    const tuitionFeeData = feeData.filter(f => !/pocket/i.test(f.description || '') && !/caution/i.test(f.description || ''));

    const pocketCollected = pocketMoneyData.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const pocketPending = pocketMoneyData.reduce((sum, f) => sum + Math.max(0, (f.amount || 0) - (f.paidAmount || 0)), 0);

    const cautionCollected = cautionDepositData.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const cautionPending = cautionDepositData.reduce((sum, f) => sum + Math.max(0, (f.amount || 0) - (f.paidAmount || 0)), 0);

    const tuitionCollected = tuitionFeeData.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const tuitionPending = tuitionFeeData.reduce((sum, f) => sum + Math.max(0, (f.amount || 0) - (f.paidAmount || 0)), 0);

    const generatedBy = req.user?.userId || req.user?.id || req.body.generatedBy;

    const report = new Report({
      title: `Financial Report - ${new Date().toLocaleString()}`,
      reportType: 'financial',
      school: schoolId,
      generatedBy,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      data: feeData.map(f => f.toJSON()),
      summary: {
        totalRecords: feeData.length,
        metrics: {
          totalCollected,
          totalPending,
          collectionRate: (totalCollected + totalPending) > 0 
            ? ((totalCollected / (totalCollected + totalPending)) * 100).toFixed(2) + '%'
            : '0%',
          tuitionCollected,
          tuitionPending,
          pocketCollected,
          pocketPending,
          cautionCollected,
          cautionPending
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
    const { classId, studentId } = req.body;

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

    const studentQuery = { class: classId };
    if (studentId) {
      studentQuery.userId = studentId;
    }

    const students = await Student.find(studentQuery).populate('userId');
    const marksQuery = { class: classId };
    if (studentId) {
      marksQuery.student = studentId;
    }
    const marksData = await Marks.find(marksQuery);

    const performanceData = students.map(student => {
      const studentMarks = marksData.filter(m => m.student.toString() === student.userId?._id?.toString() || m.student.toString() === student.userId?.toString());
      const averageMarks = studentMarks.length > 0
        ? (studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length).toFixed(2)
        : 0;

      return {
        studentId: student._id,
        name: student.userId ? `${student.userId.firstName || ''} ${student.userId.lastName || ''}`.trim() : student.admissionId,
        averageMarks,
        totalSubjects: studentMarks.length,
      };
    });

    const filters = {};
    if (classId) filters.class = classId;
    if (studentId) filters.student = studentId;

    let reportTitle = `Performance Report - Class ${classId} (${new Date().toLocaleString()})`;
    const Class = require('../models/Class');
    const cls = await Class.findById(classId);
    if (cls) {
      reportTitle = `Performance Report - Grade ${cls.grade} Section ${cls.section} (${new Date().toLocaleString()})`;
    }

    const report = new Report({
      title: reportTitle,
      reportType: 'performance',
      school,
      generatedBy,
      filters,
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

    report.fileUrl = `/api/reports/download/${report._id}`;
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateWorkingDaysReport = async (req, res) => {
  try {
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

    const Settings = require('../models/Settings');
    const settingsData = await Settings.findOne({ school });

    const report = new Report({
      title: `School Working Days Configuration Report`,
      reportType: 'working_days',
      school,
      generatedBy,
      data: settingsData ? settingsData.toJSON() : {},
      summary: {
        totalRecords: 1,
        metrics: {
          workingMonths: settingsData?.academic?.workingMonths || 10,
          workingDays: settingsData?.academic?.workingDays || 220,
          minimumAttendancePercentage: settingsData?.academic?.minimumAttendancePercentage || 75,
          passingMarks: settingsData?.academic?.passingMarks || 35,
        },
      },
      format: req.body.format || 'pdf',
      status: 'completed',
    });

    report.fileUrl = `/api/reports/download/${report._id}`;
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('school')
      .populate('generatedBy');
      
    if (!report) {
      return res.status(404).send('<h1>Report not found</h1>');
    }

    let reportTitle = report.title || 'Report';
    let dataHtml = '';

    if (report.reportType === 'working_days') {
      const config = report.data || {};
      const academic = config.academic || {};
      const general = config.general || {};
      dataHtml = `
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 20px; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">📅 Academic & School Working Days Settings</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #f1f5f9;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Working Months</span>
              <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${academic.workingMonths || '10'} Months</div>
            </div>
            <div style="padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #f1f5f9;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Working Days</span>
              <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${academic.workingDays || '220'} Days</div>
            </div>
            <div style="padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #f1f5f9;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Min Attendance Required</span>
              <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${academic.minimumAttendancePercentage || '75'}%</div>
            </div>
            <div style="padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #f1f5f9;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Passing Marks</span>
              <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${academic.passingMarks || '35'} Marks</div>
            </div>
          </div>
          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 4px 0;"><strong>System Name:</strong> ${general.systemName || 'Not Set'}</p>
            <p style="margin: 4px 0;"><strong>Timezone:</strong> ${general.timezone || 'Not Set'}</p>
          </div>
        </div>
      `;
    } else if (report.reportType === 'attendance') {
      const records = report.data || [];
      const uniqueStudentIds = [...new Set(records.map(r => String(r.student?._id || r.student)))].filter(Boolean);
      const studentCount = uniqueStudentIds.length || 1;

      // Helper: is a date a working day (not Sunday, not 2nd Saturday)?
      const isWorkingDay = (d) => {
        const day = d.getDay();
        const dateNum = d.getDate();
        if (day === 0) return false; // Sunday
        if (day === 6 && dateNum >= 8 && dateNum <= 14) return false; // 2nd Saturday
        return true;
      };

      // Only count present/absent on actual working days
      let presentDays = records.filter(r => {
        if (String(r.status).toLowerCase() !== 'present') return false;
        return r.date ? isWorkingDay(new Date(r.date)) : false;
      }).length;

      let totalCalendarDays = 0;
      let rangeHolidays = 0;
      let weekendCount = 0;

      if (report.startDate && report.endDate) {
        const start = new Date(report.startDate);
        const end = new Date(report.endDate);

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const effectiveEnd = end > today ? today : end;

        if (start <= effectiveEnd) {
          const diffTime = Math.abs(effectiveEnd - start);
          totalCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          const holidaysList = report.school?.schoolSettings?.holidays || [];
          rangeHolidays = holidaysList.filter(hDate => {
            const d = new Date(hDate);
            d.setHours(0,0,0,0);
            const compareStart = new Date(start); compareStart.setHours(0,0,0,0);
            const compareEnd = new Date(effectiveEnd); compareEnd.setHours(0,0,0,0);
            const day = d.getDay();
            const isSunday = day === 0;
            const isSecondSat = (day === 6 && d.getDate() >= 8 && d.getDate() <= 14);
            return d >= compareStart && d <= compareEnd && !isSunday && !isSecondSat;
          }).length;

          let tempDate = new Date(start);
          while (tempDate <= effectiveEnd) {
            const day = tempDate.getDay();
            const isSunday = day === 0;
            const isSecondSat = (day === 6 && tempDate.getDate() >= 8 && tempDate.getDate() <= 14);
            if (isSunday || isSecondSat) weekendCount++;
            tempDate.setDate(tempDate.getDate() + 1);
          }
        }
      } else {
        totalCalendarDays = records.length;
        rangeHolidays = 0;
      }

      const schoolWorkingDays = Math.max(0, totalCalendarDays - rangeHolidays - weekendCount);

      if (uniqueStudentIds.length > 1) {
        presentDays = Math.round(presentDays / studentCount);
      }
      const absentDays = Math.max(0, schoolWorkingDays - presentDays);
      const attendancePercentage = schoolWorkingDays > 0 ? ((presentDays / schoolWorkingDays) * 100).toFixed(2) : '0.00';

      // Filter table records to only show working-day records
      const workingDayRecords = records.filter(r => r.date ? isWorkingDay(new Date(r.date)) : false);

      dataHtml = `
        <div style="margin-bottom: 25px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: sans-serif;">
          <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 5px;">
            <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Total Days</div>
            <div style="font-size: 20px; font-weight: bold; color: #1e293b; margin-top: 5px;">${totalCalendarDays}</div>
          </div>
          <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 5px;">
            <div style="font-size: 10px; color: #6366f1; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">School Working Days</div>
            <div style="font-size: 20px; font-weight: bold; color: #4f46e5; margin-top: 5px;">${schoolWorkingDays}</div>
          </div>
          <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 5px;">
            <div style="font-size: 10px; color: #10b981; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Present Days</div>
            <div style="font-size: 20px; font-weight: bold; color: #047857; margin-top: 5px;">${presentDays}</div>
          </div>
          <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 5px;">
            <div style="font-size: 10px; color: #ef4444; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Absent Days</div>
            <div style="font-size: 20px; font-weight: bold; color: #b91c1c; margin-top: 5px;">${absentDays}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: #3b82f6; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Attendance Rate</div>
            <div style="font-size: 20px; font-weight: bold; color: #1d4ed8; margin-top: 5px;">${attendancePercentage}%</div>
          </div>
        </div>

        <h3>Attendance Records</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; font-size: 14px;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th>Date</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${workingDayRecords.map(record => {
              const studentName = record.student
                ? `${record.student.firstName || ''} ${record.student.lastName || ''}`.trim() || record.student.userId || 'N/A'
                : 'N/A';
              const d = record.date ? new Date(record.date) : null;
              const localDate = d ? `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}` : 'N/A';
              return `
                <tr>
                  <td>${localDate}</td>
                  <td>${studentName}</td>
                  <td><strong style="color: ${String(record.status).toLowerCase() === 'present' ? 'green' : String(record.status).toLowerCase() === 'absent' ? 'red' : 'orange'}">${record.status}</strong></td>
                  <td>${record.remarks || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

    } else if (report.reportType === 'academic') {
      const records = report.data || [];
      const school = report.school || {};
      const schoolName = school.name || 'Kids Science Academy, Roorkee';
      const schoolAddress = school.address ? `${school.address.street || ''}, ${school.address.city || ''}, ${school.address.state || ''}` : 'Address: Kids Science Academy, Roorkee, Uttarakhand';
      const schoolPhone = school.phone || '+919999999999';
      const schoolEmail = school.email || 'school@xyzmail.com';
      const academicYear = school.academicYear || '2024-25';
      const logoUrl = school.logo || 'https://via.placeholder.com/100?text=Logo';

      const studentsMap = {};
      const uniqueExamsSet = new Set();
      
      records.forEach(record => {
        if (!record.student) return;
        const sId = record.student._id ? record.student._id.toString() : record.student.toString();
        if (!studentsMap[sId]) {
          studentsMap[sId] = {
            info: record.student,
            subjects: {}
          };
        }
        
        const subjName = record.subject?.name || 'Unknown Subject';
        const exType = record.examType || 'Unknown Exam';
        
        uniqueExamsSet.add(exType);
        
        if (!studentsMap[sId].subjects[subjName]) {
          studentsMap[sId].subjects[subjName] = {};
        }
        studentsMap[sId].subjects[subjName][exType] = record.marks;
      });
      
      const examColumns = Array.from(uniqueExamsSet).sort();
      let htmlBlocks = [];
      
      Object.values(studentsMap).forEach(studentData => {
        const student = studentData.info;
        const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
        const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
        const attendance = '85'; // Placeholder
        
        let subjectsHtml = '';
        Object.keys(studentData.subjects).sort().forEach(subj => {
          let rowHtml = `<tr><td style="padding: 10px; border: 1px solid #204e2e;">${subj}</td>`;
          let total = 0;
          let count = 0;
          
          examColumns.forEach(ex => {
            const mark = studentData.subjects[subj][ex];
            if (mark !== undefined) {
              total += Number(mark);
              count++;
              rowHtml += `<td style="padding: 10px; border: 1px solid #204e2e; text-align: center;">${mark}</td>`;
            } else {
              rowHtml += `<td style="padding: 10px; border: 1px solid #204e2e; text-align: center;">-</td>`;
            }
          });
          
          const average = count > 0 ? (total / count).toFixed(1) : '-';
          rowHtml += `<td style="padding: 10px; border: 1px solid #204e2e; text-align: center; font-weight: bold;">${average}</td></tr>`;
          subjectsHtml += rowHtml;
        });

        const examHeadersHtml = examColumns.map(ex => `<th style="padding: 10px; border: 1px solid #ddd; text-align: center;">${ex}</th>`).join('');

        const studentHtml = `
          <div style="page-break-after: always; font-family: sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; box-sizing: border-box; position: relative; background: #fff;">
            
            <div style="position: absolute; top: 0; left: 0; width: 150px; height: 150px; background: linear-gradient(135deg, #b91c1c 50%, transparent 50%); z-index: 0;"></div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 1;">
              <div style="flex: 1;">
                <h1 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; text-transform: uppercase; text-align: center;">PRE-SCHOOL REPORT CARD</h1>
                <h3 style="color: #166534; margin: 0 0 5px 0; font-size: 16px;">${schoolName}</h3>
                <p style="margin: 2px 0; font-size: 12px; color: #555;">Address: ${schoolAddress}</p>
                <p style="margin: 2px 0; font-size: 12px; color: #555;">Phone Number: ${schoolPhone}</p>
                <p style="margin: 2px 0; font-size: 12px; color: #555;">Email: ${schoolEmail}</p>
              </div>
              <div style="text-align: right; width: 120px;">
                <img src="${logoUrl}" alt="School Logo" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #eee; padding: 5px; border-radius: 4px;" />
              </div>
            </div>

            <div style="display: flex; justify-content: center; margin: 10px 0;">
              <div style="width: 80px; height: 100px; background: #f3f4f6; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <span style="color: #9ca3af; font-size: 10px;">Photo</span>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #166534;">
              <tbody>
                <tr>
                  <td colspan="3" style="padding: 10px; border: 1px solid #166534;">
                    Name of the Student: <strong>${studentName}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #166534; width: 33%;">Date of Birth: ${dob}</td>
                  <td style="padding: 10px; border: 1px solid #166534; width: 33%;">Academic Year: ${academicYear}</td>
                  <td style="padding: 10px; border: 1px solid #166534; width: 34%;">Attendance %: ${attendance}</td>
                </tr>
              </tbody>
            </table>

            <div style="background: #166534; color: white; text-align: center; padding: 10px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
              Marks of Each Subject
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #166534;">
              <thead>
                <tr style="background: #204e2e; color: white;">
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">SUBJECTS</th>
                  ${examHeadersHtml}
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">AVERAGE</th>
                </tr>
              </thead>
              <tbody>
                ${subjectsHtml}
              </tbody>
            </table>

            <div style="font-size: 12px; margin-bottom: 20px; color: #333;">
              <strong>GRADE SCALE:</strong> A: 90%-100% &nbsp;&nbsp; B: 80%-89% &nbsp;&nbsp; C: 70%-79% &nbsp;&nbsp; D: 60%-69% &nbsp;&nbsp; F: Fail
            </div>

            <div style="border: 1px solid #333; padding: 15px; min-height: 120px; position: relative;">
              <div style="font-size: 13px; margin-bottom: 60px;">
                <strong>COMMENTS:</strong> _________________________________________________________________________<br/><br/>
                __________________________________________________________________________________________
              </div>
              
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; padding: 0 20px;">
                <span>Class Teacher Sign</span>
                <span>Principal Sign with Stamp</span>
              </div>
            </div>

          </div>
        `;
        htmlBlocks.push(studentHtml);
      });
      dataHtml = htmlBlocks.join('');
    } else if (report.reportType === 'performance') {
      const records = report.data || [];
      dataHtml = `
        <h3>Student Performance Summary</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; font-size: 14px;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th>Student Name</th>
              <th>Average Marks</th>
              <th>Total Subjects Recorded</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(record => `
              <tr>
                <td>${record.name || 'N/A'}</td>
                <td><strong>${record.averageMarks}</strong></td>
                <td>${record.totalSubjects}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (report.reportType === 'financial') {
      const records = report.data || [];
      const metrics = report.summary?.metrics || {};
      
      const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

      dataHtml = `
        <div style="margin-bottom: 25px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: sans-serif;">
          <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 5px;">
            <div style="font-size: 10px; color: #10b981; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Total Collected</div>
            <div style="font-size: 20px; font-weight: bold; color: #047857; margin-top: 5px;">${formatCurrency(metrics.totalCollected)}</div>
          </div>
          <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 5px;">
            <div style="font-size: 10px; color: #ef4444; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Total Pending</div>
            <div style="font-size: 20px; font-weight: bold; color: #b91c1c; margin-top: 5px;">${formatCurrency(metrics.totalPending)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: #3b82f6; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Collection Rate</div>
            <div style="font-size: 20px; font-weight: bold; color: #1d4ed8; margin-top: 5px;">${metrics.collectionRate || '0%'}</div>
          </div>
        </div>

        <h3 style="margin-top: 30px;">Collection Category Breakdown</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; font-size: 14px; margin-bottom: 30px; text-align: left;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th>Category</th>
              <th>Amount Collected</th>
              <th>Amount Pending</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tuition / General Fees</strong></td>
              <td style="color: green;">${formatCurrency(metrics.tuitionCollected)}</td>
              <td style="color: red;">${formatCurrency(metrics.tuitionPending)}</td>
              <td><strong>${formatCurrency((metrics.tuitionCollected || 0) + (metrics.tuitionPending || 0))}</strong></td>
            </tr>
            <tr>
              <td><strong>Pocket Money</strong></td>
              <td style="color: green;">${formatCurrency(metrics.pocketCollected)}</td>
              <td style="color: red;">${formatCurrency(metrics.pocketPending)}</td>
              <td><strong>${formatCurrency((metrics.pocketCollected || 0) + (metrics.pocketPending || 0))}</strong></td>
            </tr>
            <tr>
              <td><strong>Caution Deposit</strong></td>
              <td style="color: green;">${formatCurrency(metrics.cautionCollected)}</td>
              <td style="color: red;">${formatCurrency(metrics.cautionPending)}</td>
              <td><strong>${formatCurrency((metrics.cautionCollected || 0) + (metrics.cautionPending || 0))}</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>Transaction History</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; font-size: 14px;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th>Student Name</th>
              <th>Description / Category</th>
              <th>Total Due</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(record => {
              const studentName = record.student?.firstName
                ? `${record.student.firstName} ${record.student.lastName || ''}`.trim()
                : 'N/A';
              const isPaid = record.isPaid || (record.paidAmount >= record.amount);
              return `
                <tr>
                  <td>${studentName}</td>
                  <td>${record.description || 'Tuition Fees'}</td>
                  <td>${formatCurrency(record.amount)}</td>
                  <td>${formatCurrency(record.paidAmount)}</td>
                  <td>${formatCurrency(Math.max(0, record.amount - record.paidAmount))}</td>
                  <td>${record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span style="color: ${isPaid ? 'green' : 'red'}; font-weight: bold;">
                      ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      dataHtml = `<pre>${JSON.stringify(report.data, null, 2)}</pre>`;
    }

    res.send(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: sans-serif; margin: ${report.reportType === 'academic' ? '0' : '40px'}; color: #333; background: #f9f9f9; }
            h1.global-title { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; }
            .meta { margin-bottom: 20px; background: #fafafa; padding: 15px; border-radius: 5px; font-size: 14px; }
            .meta p { margin: 5px 0; }
            @media print {
              body { background: white; margin: 0; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body onload="window.print()">
          ${report.reportType === 'academic' ? '' : `
            <h1 class="global-title">🏫 School OS - ${reportTitle}</h1>
            <div class="meta">
              <p><strong>Report Type:</strong> ${report.reportType.toUpperCase()}</p>
              <p><strong>Format:</strong> ${report.format.toUpperCase()}</p>
              <p><strong>Generated on:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
              ${report.startDate ? `<p><strong>Start Date:</strong> ${new Date(report.startDate).toLocaleDateString()}</p>` : ''}
              ${report.endDate ? `<p><strong>End Date:</strong> ${new Date(report.endDate).toLocaleDateString()}</p>` : ''}
            </div>
          `}
          ${dataHtml}
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error generating downloadable report: ' + error.message);
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
  downloadReport,
  generateWorkingDaysReport,
};
