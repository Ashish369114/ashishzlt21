import React, { useState, useEffect } from 'react';
import { schoolService } from '../../services/api';
import '../../styles/ManagementStyles.css';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: {},
    academicYear: '',
  });
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolService.getAll();
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchool({ ...newSchool, [name]: value });
  };

  const handleEditSchool = (school) => {
    setEditingSchoolId(school._id);
    setNewSchool({
      name: school.name,
      code: school.code,
      email: school.email || '',
      phone: school.phone || '',
      address: school.address || {},
      academicYear: school.academicYear || '',
    });
  };

  const resetForm = () => {
    setEditingSchoolId(null);
    setNewSchool({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: {},
      academicYear: '',
    });
  };

  const handleAddSchool = async (e) => {
    e.preventDefault();
    try {
      if (editingSchoolId) {
        await schoolService.update(editingSchoolId, newSchool);
      } else {
        await schoolService.add(newSchool);
      }
      fetchSchools();
      resetForm();
    } catch (error) {
      console.error('Error saving school:', error);
    }
  };

  const handleDeleteSchool = async (id) => {
    try {
      await schoolService.delete(id);
      fetchSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  };

  return (
    <div className="management-container">
      <h1>School Management</h1>
      
      <form onSubmit={handleAddSchool} className="management-form">
        <input
          type="text"
          name="name"
          placeholder="School Name"
          value={newSchool.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="code"
          placeholder="School Code"
          value={newSchool.code}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newSchool.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={newSchool.phone}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="academicYear"
          placeholder="Academic Year (e.g., 2024-2025)"
          value={newSchool.academicYear}
          onChange={handleInputChange}
          required
        />
        <button type="submit">
          {editingSchoolId ? 'Update School' : 'Add School'}
        </button>
        {editingSchoolId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        )}
      </form>

      <div className="schools-list">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Academic Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school._id}>
                  <td>{school.name}</td>
                  <td>{school.code}</td>
                  <td>{school.email}</td>
                  <td>{school.phone}</td>
                  <td>{school.academicYear}</td>
                  <td>
                    <button onClick={() => handleEditSchool(school)}>Edit</button>
                    <button onClick={() => handleDeleteSchool(school._id)} style={{ marginLeft: '8px' }}>
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

export default SchoolManagement;
