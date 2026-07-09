import React, { useState, useEffect } from 'react';
import api, { classService } from '../../services/api';
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
    format: 'pdf',
    visibility: 'private',
  });
  const [loading, setLoading] = useState(false);

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
        setError('Please select a Term');
        return;
      }
    }
    
    if (reportFilters.reportType === 'performance') {
      if (!reportFilters.classId) {
        setError('Please select a Class');
        return;
      }
    }
    
    try {
      setError('');
      await api.post(`/reports/generate/${reportFilters.reportType}`, reportFilters);
      fetchReports();
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
        window.open(response.data.fileUrl, '_blank');
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

  return (
    <div className="management-container">
      <h1>Report Management</h1>

      <form onSubmit={handleGenerateReport} className="management-form">
        <h3>Generate Report</h3>
        {error && <div style={{ color: '#d32f2f', marginBottom: '10px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        <select name="reportType" value={reportFilters.reportType} onChange={handleFilterChange}>
          <option value="attendance">Attendance</option>
          <option value="academic">Academic</option>
          <option value="financial">Financial</option>
          <option value="performance">Performance</option>
        </select>
        
        {['attendance', 'financial'].includes(reportFilters.reportType) && (
          <>
            <input
              type="date"
              name="startDate"
              placeholder="Start Date"
              value={reportFilters.startDate}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="endDate"
              placeholder="End Date"
              value={reportFilters.endDate}
              onChange={handleFilterChange}
            />
          </>
        )}
        
        {reportFilters.reportType === 'academic' && (
          <input
            type="text"
            name="term"
            placeholder="Term (e.g., 1st Term, 2nd Term)"
            value={reportFilters.term}
            onChange={handleFilterChange}
          />
        )}
        
        {reportFilters.reportType === 'performance' && (
          <select name="classId" value={reportFilters.classId} onChange={handleFilterChange}>
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.grade} - {cls.section}
              </option>
            ))}
          </select>
        )}
        
        <select name="format" value={reportFilters.format} onChange={handleFilterChange}>
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
        </select>
        <button type="submit">Generate Report</button>
      </form>

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
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
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
