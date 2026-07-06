import React, { useEffect, useState } from 'react';
import { attendanceService, feeService, marksService, studentService } from '../../services/api';

const ParentDownloads = () => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [markSummaries, setMarkSummaries] = useState([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const parentResponse = await studentService.getByParent();
        const studentList = parentResponse.data || [];
        setStudents(studentList);

        const feeResponse = await feeService.getByParent();
        setFees(feeResponse.data || []);

        const markPromises = studentList.map(async (student) => {
          const studentId = student.userId?._id || student.userId;
          if (!studentId) return null;
          const markResponse = await marksService.getByStudent(studentId);
          return {
            student,
            marks: markResponse.data || [],
          };
        });

        const attendancePromises = studentList.map(async (student) => {
          const studentId = student.userId?._id || student.userId;
          if (!studentId) return null;
          const attendanceResponse = await attendanceService.getByStudent(studentId);
          return {
            student,
            attendance: attendanceResponse.data || [],
          };
        });

        const marksData = await Promise.all(markPromises);
        const attendanceData = await Promise.all(attendancePromises);

        setMarkSummaries(marksData.filter(Boolean));
        setAttendanceSummaries(attendanceData.filter(Boolean));
      } catch (err) {
        console.error(err);
        setError('Failed to load downloadable summaries.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatStudentName = (student) => {
    return `${student.userId?.firstName || student.firstName || 'Student'} ${student.userId?.lastName || student.lastName || ''}`.trim();
  };

  const createDownloadFile = (fileName, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadFeeStatement = (student) => {
    const studentFees = fees.filter((fee) => {
      const feeStudentId = fee.student?._id || fee.student;
      const studentId = student._id || student.userId?._id || student.userId;
      return String(feeStudentId) === String(studentId);
    });

    const dueAmount = studentFees.filter((fee) => !fee.isPaid).reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = studentFees.filter((fee) => fee.isPaid).reduce((sum, fee) => sum + fee.amount, 0);

    const content = [`Fee Statement for ${formatStudentName(student)}`, '=========================================', `Total Invoices: ${studentFees.length}`, `Paid Amount: ₹${paidAmount}`, `Pending Amount: ₹${dueAmount}`, '', 'Details:'];
    studentFees.forEach((fee) => {
      content.push(`- ${fee.description || 'Fee item'}: ₹${fee.amount} | ${fee.isPaid ? 'Paid' : 'Pending'} | Due ${fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}`);
    });

    createDownloadFile(`fee-statement-${student._id || student.userId || 'child'}.txt`, content.join('\n'));
  };

  const handleDownloadAttendance = (summary) => {
    const content = [`Attendance Summary for ${formatStudentName(summary.student)}`, '=========================================', `Total Records: ${summary.attendance.length}`, '', 'Details:'];
    summary.attendance.forEach((record) => {
      content.push(`- ${new Date(record.date).toLocaleDateString()}: ${record.status} ${record.remarks ? `| Notes: ${record.remarks}` : ''}`);
    });
    createDownloadFile(`attendance-summary-${summary.student._id || summary.student.userId || 'child'}.txt`, content.join('\n'));
  };

  const handleDownloadAcademicSummary = (summary) => {
    const content = [`Academic Summary for ${formatStudentName(summary.student)}`, '=========================================', `Total Marks Entries: ${summary.marks.length}`, '', 'Marks:'];
    summary.marks.forEach((mark) => {
      content.push(`- ${mark.subject?.name || 'Subject'}: ${mark.marks}/100 | ${mark.examType || 'Exam'} | ${mark.examDate ? new Date(mark.examDate).toLocaleDateString() : 'N/A'}`);
    });
    createDownloadFile(`academic-summary-${summary.student._id || summary.student.userId || 'child'}.txt`, content.join('\n'));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📥 Child Documents</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="spinner"></div>
      ) : students.length === 0 ? (
        <div className="card-content">No linked children found for downloads.</div>
      ) : (
        <div>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Children Linked</h3>
              <div className="value">{students.length}</div>
            </div>
            <div className="stat-card">
              <h3>Fee Reports</h3>
              <div className="value">{fees.length}</div>
            </div>
            <div className="stat-card">
              <h3>Attendance Records</h3>
              <div className="value">{attendanceSummaries.reduce((sum, item) => sum + item.attendance.length, 0)}</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Fee Statement</th>
                  <th>Attendance Report</th>
                  <th>Academic Summary</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const summary = markSummaries.find((item) => String(item.student._id || item.student.userId?._id || item.student.userId) === String(student._id || student.userId?._id || student.userId));
                  const attendanceSummary = attendanceSummaries.find((item) => String(item.student._id || item.student.userId?._id || item.student.userId) === String(student._id || student.userId?._id || student.userId));
                  return (
                    <tr key={student._id || student.userId || student.id}>
                      <td>{formatStudentName(student)}</td>
                      <td>
                        <button className="btn btn-small btn-primary" onClick={() => handleDownloadFeeStatement(student)}>
                          Download Fee Statement
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleDownloadAttendance(attendanceSummary || { student, attendance: [] })}
                        >
                          Download Attendance
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-small btn-success"
                          onClick={() => handleDownloadAcademicSummary(summary || { student, marks: [] })}
                        >
                          Download Academic Summary
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDownloads;
