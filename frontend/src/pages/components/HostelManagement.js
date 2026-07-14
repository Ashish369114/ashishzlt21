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
  const [showAddForm, setShowAddForm] = useState(false);

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
    setShowAddForm(true);
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

      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>{editingHostelId ? 'Update Hostel' : 'Add New Hostel'}</h3>
              <button onClick={() => { resetHostelForm(); setShowAddForm(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280', padding: '0 5px' }}>&times;</button>
            </div>
            <form onSubmit={handleAddHostel} className="management-form" style={{ marginBottom: 0, boxShadow: 'none', padding: 0 }}>
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
              <button type="submit" className="btn btn-primary">{editingHostelId ? 'Update Hostel' : 'Add Hostel'}</button>
              {editingHostelId && (
                <button type="button" onClick={() => { resetHostelForm(); setShowAddForm(false); }} style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <div className="hostels-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Hostels</h3>
          <button onClick={() => setShowAddForm(true)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', width: 'fit-content' }}>
            + Add Hostel
          </button>
        </div>
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
