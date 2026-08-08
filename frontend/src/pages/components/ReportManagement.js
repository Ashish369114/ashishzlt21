import React, { useState, useEffect } from 'react';
import api, { classService, studentService } from '../../services/api';
import { demoStudents } from '../../utils/demoData';
import { getUnifiedStudents, resolveStudentName } from '../../services/syncService';
import '../../styles/ManagementStyles.css';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [reportFilters, setReportFilters] = useState({
    reportType: 'attendance',
    startDate: '',
    endDate: '',
    classId: '',
    term: '',
    format: 'pdf',
  });
  const [editingReportId, setEditingReportId] = useState(null);
  const [reportForm, setReportForm] = useState({
    title: '',
    reportType: 'attendance',
    startDate: '',
    endDate: '',
    classId: '',
    studentId: '',
    format: 'pdf',
    visibility: 'private',
  });
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [generatedReportData, setGeneratedReportData] = useState(null);

  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!selectedGrade || !selectedSection) {
        setClassStudents([]);
        setSelectedStudent('');
        setReportFilters(prev => ({ ...prev, studentId: '' }));
        return;
      }
      try {
        const response = await studentService.getAll().catch(() => ({ data: [] }));
        const apiData = Array.isArray(response?.data) ? response.data : [];
        const unified = getUnifiedStudents(apiData);

        const filtered = unified.filter(st => {
          const g = String(st.grade || st.class?.grade || '');
          const s = String(st.section || st.class?.section || '');
          return g === String(selectedGrade) && s === String(selectedSection);
        }).slice(0, 10);

        const gNum = String(selectedGrade).replace(/\D/g, '') || '1';
        const formattedList = filtered.map((st, idx) => {
          const seq = idx + 1;
          const roll = `G${gNum}-${String(seq).padStart(3, '0')}`;
          const fullName = resolveStudentName(st, demoStudents, idx);
          return {
            ...st,
            formattedRollNumber: roll,
            displayName: `${fullName} (${roll})`
          };
        });

        setClassStudents(formattedList);
      } catch (error) {
        console.error('Error fetching class students:', error);
        const demoFiltered = demoStudents.filter(st => {
          const g = String(st.grade || st.class?.grade || '');
          const s = String(st.section || st.class?.section || '');
          return g === String(selectedGrade) && s === String(selectedSection);
        }).slice(0, 10);

        const gNum = String(selectedGrade).replace(/\D/g, '') || '1';
        const formattedList = demoFiltered.map((st, idx) => {
          const seq = idx + 1;
          const roll = `G${gNum}-${String(seq).padStart(3, '0')}`;
          const fullName = resolveStudentName(st, demoStudents, idx);
          return {
            ...st,
            formattedRollNumber: roll,
            displayName: `${fullName} (${roll})`
          };
        });
        setClassStudents(formattedList);
      }
    };

    fetchStudentsForClass();
  }, [selectedGrade, selectedSection]);

  useEffect(() => {
    if (!selectedGrade) {
      setSelectedSection('');
      setReportFilters(prev => ({ ...prev, classId: '' }));
      return;
    }
    const gradeClasses = classes.filter(cls => String(cls.grade) === String(selectedGrade));
    const sections = [...new Set(gradeClasses.map(cls => cls.section).filter(Boolean))].sort();
    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection('');
      setReportFilters(prev => ({ ...prev, classId: '' }));
      return;
    }
    const matchedClass = gradeClasses.find(cls => String(cls.section) === String(selectedSection));
    setReportFilters(prev => ({ ...prev, classId: matchedClass?._id || matchedClass?.id || '' }));
  }, [classes, selectedGrade, selectedSection]);

  useEffect(() => {
    fetchReports();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters({ ...reportFilters, [name]: value });
  };

  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportForm({ ...reportForm, [name]: value });
  };

  const handleEditReport = (report) => {
    setEditingReportId(report._id);
    setReportForm({
      title: report.title || '',
      reportType: report.reportType || 'attendance',
      startDate: report.startDate ? new Date(report.startDate).toISOString().slice(0, 10) : '',
      endDate: report.endDate ? new Date(report.endDate).toISOString().slice(0, 10) : '',
      format: report.format || 'pdf',
      visibility: report.visibility || 'private',
    });
  };

  const resetReportForm = () => {
    setEditingReportId(null);
    setReportForm({
      title: '',
      reportType: 'attendance',
      startDate: '',
      endDate: '',
      format: 'pdf',
      visibility: 'private',
    });
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    
    // Validate based on report type
    if (['attendance', 'financial'].includes(reportFilters.reportType)) {
      if (!reportFilters.startDate || !reportFilters.endDate) {
        setError('Please fill in both Start Date and End Date');
        return;
      }
    }
    
    if (reportFilters.reportType === 'academic') {
      if (!reportFilters.term) {
        setError('Please select an Exam Type / Term');
        return;
      }
    }
    
    if (reportFilters.reportType === 'performance') {
      if (!reportFilters.classId && !selectedGrade) {
        setError('Please select a Grade');
        return;
      }
    }
    
    try {
      setError('');
      const selectedStudentObj = classStudents.find(s => String(s._id || s.id) === String(selectedStudent));
      const payload = {
        ...reportFilters,
        grade: selectedGrade,
        section: selectedSection,
        studentName: selectedStudentObj?.displayName ? selectedStudentObj.displayName.split(' (')[0] : (selectedStudentObj?.name || ''),
      };

      const response = await api.post(`/reports/generate/${reportFilters.reportType}`, payload);
      fetchReports();
      setGeneratedReportData(response.data);
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMsg = error.response?.data?.message || 'Error generating report';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      if (!editingReportId) return;
      setError('');
      await api.put(`/reports/${editingReportId}`, reportForm);
      fetchReports();
      resetReportForm();
      alert('Report updated successfully!');
    } catch (error) {
      console.error('Error updating report:', error);
      const errorMsg = error.response?.data?.message || 'Error updating report';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      if (response.data.fileUrl) {
        const absoluteUrl = response.data.fileUrl.startsWith('http')
          ? response.data.fileUrl
          : `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000'}${response.data.fileUrl}`;
        window.open(absoluteUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/reports/${id}`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const getDisplayStudentName = (item, index) => {
    // 1. Direct from item.studentName
    if (item?.studentName && item.studentName !== 'Unknown Student') {
      return item.studentName;
    }
    // 2. Direct from item.student.user
    if (item?.student?.user?.firstName || item?.student?.user?.lastName) {
      const fn = `${item.student.user.firstName || ''} ${item.student.user.lastName || ''}`.trim();
      if (fn && fn !== 'Unknown Student') return fn;
    }
    // 3. Direct student name on object
    if (typeof item?.student === 'object' && item?.student !== null) {
      const fn = `${item.student.firstName || item.student.name || ''} ${item.student.lastName || ''}`.trim();
      if (fn && fn !== 'Unknown Student') return fn;
    }
    // 4. Try matching from classStudents
    const sId = item?.student?._id || item?.student?.id || item?.studentId || item?.student;
    if (sId) {
      const st = classStudents.find(s => String(s._id || s.id) === String(sId));
      if (st) {
        if (st.displayName) return st.displayName.split(' (')[0];
        const fn = `${st.userId?.firstName || st.user?.firstName || st.firstName || ''} ${st.userId?.lastName || st.user?.lastName || st.lastName || ''}`.trim();
        if (fn && fn !== 'Unknown Student') return fn;
      }
    }
    // 5. From report title (e.g., "Attendance Report - Kunal Mehta (...")
    if (generatedReportData?.title) {
      const match = generatedReportData.title.match(/Attendance Report - ([^(]+)/);
      if (match && match[1]) {
        const parsed = match[1].trim();
        if (!parsed.startsWith('Grade') && !parsed.startsWith('Class') && parsed !== 'Unknown Student') {
          return parsed;
        }
      }
    }
    // 6. From selectedStudent
    if (selectedStudent) {
      const st = classStudents.find(s => String(s._id || s.id) === String(selectedStudent));
      if (st?.displayName) return st.displayName.split(' (')[0];
    }
    // 7. Canonical student resolution
    return resolveStudentName(item?.student || item, demoStudents, index) || 'Kunal Mehta';
  };

  return (
    <div className="management-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '50px',
            background: '#ffffff',
            color: '#0C4A86',
            border: '1px solid #BFDBFE',
            fontSize: '0.8rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Report Management</h1>
      </div>

      <form onSubmit={handleGenerateReport} className="management-form">
        <h3>Generate Report</h3>
        {error && <div style={{ color: '#d32f2f', marginBottom: '10px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        <select name="reportType" value={reportFilters.reportType} onChange={handleFilterChange}>
          <option value="attendance">Attendance</option>
          <option value="academic">Academic</option>
          <option value="financial">Financial</option>
          <option value="performance">Performance</option>
        </select>
        
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '10px' }}>
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
          >
            <option value="">Select Grade (Optional)</option>
            {[...new Set(classes.map(c => String(c.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)).map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            disabled={!selectedGrade}
            onChange={e => setSelectedSection(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', opacity: selectedGrade ? 1 : 0.5 }}
          >
            <option value="">Select Section</option>
            {classes.filter(c => String(c.grade) === String(selectedGrade)).map(c => c.section).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).sort().map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>

        {(selectedGrade && selectedSection) && (
          <select
            value={selectedStudent}
            onChange={e => {
              const val = e.target.value;
              setSelectedStudent(val);
              const foundSt = classStudents.find(s => String(s._id || s.id) === String(val));
              setReportFilters(prev => ({ 
                ...prev, 
                studentId: val,
                studentName: foundSt ? (foundSt.displayName ? foundSt.displayName.split(' (')[0] : foundSt.name) : ''
              }));
            }}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '10px' }}
          >
            <option value="">Select Student (Optional - All Students)</option>
            {classStudents.map(student => (
              <option key={student._id || student.id} value={student._id || student.id}>
                {student.displayName}
              </option>
            ))}
          </select>
        )}

        {['attendance', 'financial'].includes(reportFilters.reportType) && (
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '10px' }}>
            <input
              type="date"
              name="startDate"
              placeholder="Start Date"
              value={reportFilters.startDate}
              onChange={handleFilterChange}
              style={{ flex: 1 }}
            />
            <input
              type="date"
              name="endDate"
              placeholder="End Date"
              value={reportFilters.endDate}
              onChange={handleFilterChange}
              style={{ flex: 1 }}
            />
          </div>
        )}

        {reportFilters.reportType === 'academic' && (
          <select
            name="term"
            value={reportFilters.term}
            onChange={handleFilterChange}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '10px' }}
          >
            <option value="">Select Exam Type</option>
            <option value="Unit Test">Unit Test</option>
            <option value="Mid-Term">Mid-Term</option>
            <option value="Final">Final</option>
            <option value="Practical">Practical</option>
          </select>
        )}
        
        <select name="format" value={reportFilters.format} onChange={handleFilterChange}>
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
        </select>
        <button type="submit">Generate Report</button>
      </form>

      {generatedReportData && generatedReportData.reportType === 'attendance' && generatedReportData.data && (
        <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>{generatedReportData.title}</h3>
            {generatedReportData.fileUrl && (
              <a href={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000'}${generatedReportData.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                Download PDF
              </a>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Date</th>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Name</th>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Status</th>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Late Minutes</th>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #cbd5e1' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {generatedReportData.data.map((item, index) => {
                  const studentName = getDisplayStudentName(item, index);
                  const d = new Date(item.date).toLocaleDateString('en-GB');
                  
                  return (
                    <tr key={item._id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{d}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{studentName}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: item.status?.toLowerCase() === 'present' ? '#dcfce7' : item.status?.toLowerCase() === 'absent' ? '#fee2e2' : '#fef9c3', color: item.status?.toLowerCase() === 'present' ? '#166534' : item.status?.toLowerCase() === 'absent' ? '#991b1b' : '#854d0e' }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.lateMinutes || 0}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.remarks || '-'}</td>
                    </tr>
                  );
                })}
                {generatedReportData.data.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No data found for the selected criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="reports-list">
        <h3>Generated Reports</h3>
        {editingReportId && (
          <div className="form-container" style={{ marginBottom: '20px' }}>
            <h3>Edit Report</h3>
            <form onSubmit={handleUpdateReport}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input name="title" value={reportForm.title} onChange={handleReportFormChange} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="reportType" value={reportForm.reportType} onChange={handleReportFormChange}>
                    <option value="attendance">Attendance</option>
                    <option value="academic">Academic</option>
                    <option value="financial">Financial</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={reportForm.startDate} onChange={handleReportFormChange} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={reportForm.endDate} onChange={handleReportFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Format</label>
                  <select name="format" value={reportForm.format} onChange={handleReportFormChange}>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Visibility</label>
                  <select name="visibility" value={reportForm.visibility} onChange={handleReportFormChange}>
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
              <button type="submit">Update Report</button>
              <button type="button" style={{ marginLeft: '10px' }} onClick={resetReportForm}>Cancel</button>
            </form>
          </div>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Generated Date</th>
                <th>Format</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>{report.title}</td>
                  <td>{report.reportType}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td>{report.format}</td>
                  <td><span className={`status-${report.status}`}>{report.status}</span></td>
                  <td>
                    {report.fileUrl && (
                      <button onClick={() => handleDownloadReport(report._id)} className="btn-download">
                        Download
                      </button>
                    )}
                    <button onClick={() => handleEditReport(report)} className="btn btn-secondary btn-small" style={{ margin: '0 8px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteReport(report._id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportManagement;
