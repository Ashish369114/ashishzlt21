import React, { useEffect, useState } from 'react';
import { examService, homeworkService, studentService } from '../../services/api';

const StudentDownloads = ({ userId }) => {
  const [student, setStudent] = useState(null);
  const [homework, setHomework] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResources = async () => {
      if (!userId) {
        setError('Student login not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentResponse = await studentService.getByUserId(userId);
        const studentData = studentResponse.data;
        setStudent(studentData);

        const homeworkResponse = await homeworkService.getByStudent(userId);
        setHomework(homeworkResponse.data || []);

        const classId = studentData.class?._id || studentData.class;
        if (classId) {
          const examsResponse = await examService.getByClass(classId);
          setExams(examsResponse.data || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load downloadable resources.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [userId]);

  const createDownloadFile = (fileName, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadHomeworkSummary = () => {
    const content = [
      `Homework Summary for ${student?.userId?.firstName || student?.firstName || 'Student'}`,
      '=========================================',
      `Total Assignments: ${homework.length}`,
      '',
      ...homework.map((item) => `- ${item.title} | Due: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'} | Subject: ${item.subject?.name || 'N/A'}`),
    ];

    createDownloadFile(`homework-summary-${student?.userId?._id || 'student'}.txt`, content.join('\n'));
  };

  const downloadExamSchedule = () => {
    const content = [
      `Exam Schedule for ${student?.userId?.firstName || student?.firstName || 'Student'}`,
      '=========================================',
      `Class: ${student?.class?.grade || student?.class || 'N/A'} ${student?.class?.section || ''}`,
      '',
      ...exams.map((exam) => `- ${exam.name || exam.title || 'Exam'} | Subject: ${exam.subject?.name || 'N/A'} | Date: ${exam.examDate ? new Date(exam.examDate).toLocaleDateString() : exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}`),
    ];

    createDownloadFile(`exam-schedule-${student?.userId?._id || 'student'}.txt`, content.join('\n'));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📥 Student Downloads</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Homework Items</h3>
              <div className="value">{homework.length}</div>
            </div>
            <div className="stat-card">
              <h3>Exam Items</h3>
              <div className="value">{exams.length}</div>
            </div>
            <div className="stat-card">
              <h3>Grade</h3>
              <div className="value">{student?.class?.grade || student?.class || 'N/A'}</div>
            </div>
          </div>

          <div className="card-content">
            <p>Download useful summaries and schedules for your studies.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={downloadHomeworkSummary}>
                Download Homework Summary
              </button>
              <button className="btn btn-secondary" onClick={downloadExamSchedule}>
                Download Exam Schedule
              </button>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Homework Summary</td>
                  <td>Download all current homework assignments.</td>
                  <td>
                    <button className="btn btn-small btn-primary" onClick={downloadHomeworkSummary}>
                      Download
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Exam Schedule</td>
                  <td>Download upcoming exam dates and subjects.</td>
                  <td>
                    <button className="btn btn-small btn-secondary" onClick={downloadExamSchedule}>
                      Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDownloads;
