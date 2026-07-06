import React, { useState, useEffect } from 'react';
import api, { classService, schoolService } from '../../services/api';
import '../../styles/ManagementStyles.css';

const AdmissionManagement = () => {
  const [admissions, setAdmissions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newApplication, setNewApplication] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    school: '',
    appliedForClass: '',
    address: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmissions();
    fetchFormOptions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admissions');
      setAdmissions(response.data);
      setPendingCount(response.data.filter(a => a.status === 'pending').length);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [schoolsRes, classesRes] = await Promise.all([
        schoolService.getAll(),
        classService.getAll(),
      ]);
      setSchools(schoolsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching form options:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApplication({ ...newApplication, [name]: value });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admissions', newApplication);
      fetchAdmissions();
      setNewApplication({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        address: {},
        appliedForClass: '',
      });
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application');
    }
  };

  const handleApproveAdmission = async (id) => {
    try {
      await api.post(`/admissions/${id}/approve`, {});
      fetchAdmissions();
    } catch (error) {
      console.error('Error approving admission:', error);
    }
  };

  const handleRejectAdmission = async (id) => {
    try {
      const reason = prompt('Enter rejection reason:');
      if (reason) {
        await api.post(`/admissions/${id}/reject`, { rejectionReason: reason });
        fetchAdmissions();
      }
    } catch (error) {
      console.error('Error rejecting admission:', error);
    }
  };

  return (
    <div className="management-container">
      <h1>Admission Management</h1>
      <p className="status-badge">Pending Applications: <strong>{pendingCount}</strong></p>

      <form onSubmit={handleSubmitApplication} className="management-form">
        <h3>New Admission Application</h3>
        <div className="form-row">
          <input
            type="text"
            name="firstName"
            placeholder="Student First Name"
            value={newApplication.firstName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Student Last Name"
            value={newApplication.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <input
          type="date"
          name="dateOfBirth"
          value={newApplication.dateOfBirth}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="parentName"
          placeholder="Parent Name"
          value={newApplication.parentName}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="parentEmail"
          placeholder="Parent Email"
          value={newApplication.parentEmail}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="parentPhone"
          placeholder="Parent Phone"
          value={newApplication.parentPhone}
          onChange={handleInputChange}
          required
        />
        <select
          name="gender"
          value={newApplication.gender}
          onChange={handleInputChange}
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          name="school"
          value={newApplication.school}
          onChange={handleInputChange}
          required
        >
          <option value="">Select School</option>
          {schools.map((school) => (
            <option key={school._id} value={school._id}>{school.name}</option>
          ))}
        </select>
        <select
          name="appliedForClass"
          value={newApplication.appliedForClass}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Class</option>
          {classes.map((classItem) => (
            <option key={classItem._id} value={classItem._id}>{classItem.grade} {classItem.section}</option>
          ))}
        </select>
        <button type="submit">Submit Application</button>
      </form>

      <div className="applications-list">
        <h3>Applications</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Parent Email</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((admission) => (
                <tr key={admission._id}>
                  <td>{admission.firstName} {admission.lastName}</td>
                  <td>{admission.parentEmail}</td>
                  <td><span className={`status-${admission.status}`}>{admission.status}</span></td>
                  <td>{new Date(admission.applicationDate).toLocaleDateString()}</td>
                  <td>
                    {admission.status === 'pending' && (
                      <>
                        <button onClick={() => handleApproveAdmission(admission._id)} className="btn-approve">
                          Approve
                        </button>
                        <button onClick={() => handleRejectAdmission(admission._id)} className="btn-reject">
                          Reject
                        </button>
                      </>
                    )}
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

export default AdmissionManagement;
