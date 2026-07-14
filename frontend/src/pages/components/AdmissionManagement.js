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
      if (schoolsRes.data?.length > 0) {
        setNewApplication(prev => ({ ...prev, school: schoolsRes.data[0]._id }));
      }
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

    const finalSchool = newApplication.school || schools[0]?._id;
    if (!finalSchool || !newApplication.appliedForClass) {
      alert('Please select a class before submitting.');
      return;
    }

    const payload = {
      firstName: newApplication.firstName,
      lastName: newApplication.lastName,
      dateOfBirth: newApplication.dateOfBirth,
      gender: newApplication.gender,
      parentName: newApplication.parentName,
      parentEmail: newApplication.parentEmail,
      parentPhone: newApplication.parentPhone,
      school: finalSchool,
      appliedForClass: newApplication.appliedForClass,
      address: newApplication.address,
    };

    console.log('Submitting admission payload:', payload);

    try {
      await api.post('/admissions', payload);
      fetchAdmissions();
      setNewApplication({
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
      alert('Student registered successfully!');
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.response?.data || error.message;
      console.error('Error submitting application:', serverMessage, error);
      alert(`Error submitting application: ${serverMessage}`);
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
      <h1>Student Registration</h1>

      <form onSubmit={handleSubmitApplication} className="management-form">
        <h3>Add New Student</h3>
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
        <button type="submit">Add Student</button>
      </form>
    </div>
  );
};

export default AdmissionManagement;
