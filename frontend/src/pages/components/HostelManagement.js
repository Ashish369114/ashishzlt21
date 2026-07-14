import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/ManagementStyles.css';
import { formatCurrency } from '../../utils/currencyFormatter';

const HostelManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [error, setError] = useState('');
  const [newHostel, setNewHostel] = useState({
    hostelName: '',
    hostelType: 'boys',
    wardenName: '',
    wardenPhone: '',
    totalRooms: 1,
    totalBeds: 10,
    monthlyFee: 0,
  });
  const [editingHostelId, setEditingHostelId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHostel({ ...newHostel, [name]: value });
  };

  const handleEditHostel = (hostel) => {
    setEditingHostelId(hostel._id);
    setNewHostel({
      hostelName: hostel.hostelName,
      hostelType: hostel.hostelType,
      wardenName: hostel.wardenName,
      wardenPhone: hostel.wardenPhone,
      totalRooms: hostel.totalRooms,
      totalBeds: hostel.totalBeds,
      monthlyFee: hostel.monthlyFee,
    });
  };

  const resetHostelForm = () => {
    setEditingHostelId(null);
    setNewHostel({
      hostelName: '',
      hostelType: 'boys',
      wardenName: '',
      wardenPhone: '',
      totalRooms: 1,
      totalBeds: 10,
      monthlyFee: 0,
    });
    setError('');
  };

  const handleAddHostel = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newHostel.hostelName || !newHostel.hostelType) {
      setError('Please fill in all required fields: Hostel Name and Hostel Type');
      return;
    }
    
    if (newHostel.totalRooms <= 0 || newHostel.totalBeds <= 0) {
      setError('Total Rooms and Total Beds must be at least 1');
      return;
    }
    
    try {
      setError('');
      if (editingHostelId) {
        await api.put(`/hostels/${editingHostelId}`, newHostel);
        alert('Hostel updated successfully!');
      } else {
        await api.post('/hostels', newHostel);
        alert('Hostel added successfully!');
      }
      fetchHostels();
      resetHostelForm();
    } catch (error) {
      console.error('Error saving hostel:', error);
      const errorMsg = error.response?.data?.message || 'Error saving hostel';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleDeleteHostel = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/hostels/${id}`);
        fetchHostels();
      } catch (error) {
        console.error('Error deleting hostel:', error);
      }
    }
  };

  return (
    <div className="management-container">
      <h1>Hostel Management</h1>

      <form onSubmit={handleAddHostel} className="management-form">
        <h3>Add New Hostel</h3>
        {error && <div style={{ color: '#d32f2f', marginBottom: '10px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        <input
          type="text"
          name="hostelName"
          placeholder="Hostel Name"
          value={newHostel.hostelName}
          onChange={handleInputChange}
          required
        />
        <select name="hostelType" value={newHostel.hostelType} onChange={handleInputChange}>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
          <option value="mixed">Mixed</option>
        </select>
        <input
          type="text"
          name="wardenName"
          placeholder="Warden Name"
          value={newHostel.wardenName}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="wardenPhone"
          placeholder="Warden Phone"
          value={newHostel.wardenPhone}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="totalRooms"
          placeholder="Total Rooms (e.g., 10)"
          value={newHostel.totalRooms}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="totalBeds"
          placeholder="Total Beds (e.g., 50)"
          value={newHostel.totalBeds}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="monthlyFee"
          placeholder="Monthly Fee (₹)"
          value={newHostel.monthlyFee}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{editingHostelId ? 'Update Hostel' : 'Add Hostel'}</button>
        {editingHostelId && (
          <button type="button" onClick={resetHostelForm} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        )}
      </form>

      <div className="hostels-list">
        <h3>Hostels</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Warden</th>
                <th>Total Rooms</th>
                <th>Total Beds</th>
                <th>Monthly Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => (
                <tr key={hostel._id}>
                  <td>{hostel.hostelName}</td>
                  <td>{hostel.hostelType}</td>
                  <td>{hostel.wardenName}</td>
                  <td>{hostel.totalRooms}</td>
                  <td>{hostel.totalBeds}</td>
                  <td>{formatCurrency(hostel.monthlyFee)}</td>
                  <td>
                    <button onClick={() => handleEditHostel(hostel)} style={{ marginRight: '8px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteHostel(hostel._id)} className="btn-delete">
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

export default HostelManagement;
