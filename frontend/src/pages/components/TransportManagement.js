import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/ManagementStyles.css';

const TransportManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');
  const [newRoute, setNewRoute] = useState({
    routeName: '',
    startPoint: { name: '' },
    endPoint: { name: '' },
    pickupTime: '',
    dropTime: '',
    vehicle: { vehicleNumber: '' },
    driver: { driverName: '', phone: '' },
  });
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transport').catch(() => ({ data: [] }));
      const apiRoutes = Array.isArray(response.data) ? response.data : [];
      if (apiRoutes.length > 0) {
        setRoutes(apiRoutes);
      } else {
        setRoutes([
          { _id: 'r1', routeName: 'Route 1 – Sector 5 to School', startPoint: { name: 'Sector 5, Gandhi Nagar' }, endPoint: { name: 'ABC International School' }, pickupTime: '7:00 AM', dropTime: '3:30 PM', vehicle: { vehicleNumber: 'RJ 14 AA 1234' }, driver: { driverName: 'Ramu Prasad', phone: '9876543201' }, totalStudents: 32 },
          { _id: 'r2', routeName: 'Route 2 – Civil Lines to School', startPoint: { name: 'Civil Lines, Market' }, endPoint: { name: 'ABC International School' }, pickupTime: '7:15 AM', dropTime: '3:45 PM', vehicle: { vehicleNumber: 'RJ 14 BB 5678' }, driver: { driverName: 'Suresh Kumar', phone: '9876543202' }, totalStudents: 28 },
          { _id: 'r3', routeName: 'Route 3 – Vaishali Nagar to School', startPoint: { name: 'Vaishali Nagar, Main Chowk' }, endPoint: { name: 'ABC International School' }, pickupTime: '7:30 AM', dropTime: '4:00 PM', vehicle: { vehicleNumber: 'RJ 14 CC 9012' }, driver: { driverName: 'Mohan Lal', phone: '9876543203' }, totalStudents: 35 },
          { _id: 'r4', routeName: 'Route 4 – Malviya Nagar to School', startPoint: { name: 'Malviya Nagar, Bus Stand' }, endPoint: { name: 'ABC International School' }, pickupTime: '7:00 AM', dropTime: '3:30 PM', vehicle: { vehicleNumber: 'RJ 14 DD 3456' }, driver: { driverName: 'Dinesh Singh', phone: '9876543204' }, totalStudents: 24 },
          { _id: 'r5', routeName: 'Route 5 – Mansarovar to School', startPoint: { name: 'Mansarovar, Subway' }, endPoint: { name: 'ABC International School' }, pickupTime: '7:20 AM', dropTime: '3:50 PM', vehicle: { vehicleNumber: 'RJ 14 EE 7890' }, driver: { driverName: 'Rakesh Verma', phone: '9876543205' }, totalStudents: 30 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewRoute({
        ...newRoute,
        [parent]: { ...newRoute[parent], [child]: value },
      });
    } else {
      setNewRoute({ ...newRoute, [name]: value });
    }
  };

  const handleEditRoute = (route) => {
    setEditingRouteId(route._id || route.id);
    setNewRoute({
      routeName: route.routeName,
      startPoint: { name: route.startPoint?.name || '' },
      endPoint: { name: route.endPoint?.name || '' },
      pickupTime: route.pickupTime || '',
      dropTime: route.dropTime || '',
      vehicle: { vehicleNumber: route.vehicle?.vehicleNumber || '' },
      driver: { driverName: route.driver?.driverName || '', phone: route.driver?.phone || '' },
    });
    setShowAddForm(true);
  };

  const resetRouteForm = () => {
    setEditingRouteId(null);
    setNewRoute({
      routeName: '',
      startPoint: { name: '' },
      endPoint: { name: '' },
      pickupTime: '',
      dropTime: '',
      vehicle: { vehicleNumber: '' },
      driver: { driverName: '' },
    });
    setError('');
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newRoute.routeName || !newRoute.startPoint.name || !newRoute.endPoint.name) {
      setError('Please fill in all required fields: Route Name, Start Point, and End Point');
      return;
    }
    
    try {
      setError('');
      if (editingRouteId) {
        await api.put(`/transport/${editingRouteId}`, newRoute);
        alert('Route updated successfully!');
      } else {
        await api.post('/transport', newRoute);
        alert('Route added successfully!');
      }
      fetchRoutes();
      resetRouteForm();
    } catch (error) {
      console.error('Error saving route:', error);
      const errorMsg = error.response?.data?.message || 'Error saving route';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/transport/${id}`);
        fetchRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  return (
    <div className="management-container">
      <h1>Transport Management</h1>

      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>{editingRouteId ? 'Update Route' : 'Add New Route'}</h3>
              <button onClick={() => { resetRouteForm(); setShowAddForm(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280', padding: '0 5px' }}>&times;</button>
            </div>
            <form onSubmit={handleAddRoute} className="management-form" style={{ marginBottom: 0, boxShadow: 'none', padding: 0 }}>
              {error && <div style={{ color: '#d32f2f', marginBottom: '10px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
              <input
                type="text"
                name="routeName"
                placeholder="Route Name"
                value={newRoute.routeName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="startPoint.name"
                placeholder="Starting Point"
                value={newRoute.startPoint.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="endPoint.name"
                placeholder="Ending Point"
                value={newRoute.endPoint.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="time"
                name="pickupTime"
                value={newRoute.pickupTime}
                onChange={handleInputChange}
                required
              />
              <input
                type="time"
                name="dropTime"
                value={newRoute.dropTime}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="vehicle.vehicleNumber"
                placeholder="Vehicle Number"
                value={newRoute.vehicle.vehicleNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="driver.driverName"
                placeholder="Driver Name"
                value={newRoute.driver.driverName}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="driver.phone"
                placeholder="Driver Phone"
                value={newRoute.driver.phone || ''}
                onChange={handleInputChange}
              />
              <button type="submit" className="btn btn-primary">{editingRouteId ? 'Update Route' : 'Add Route'}</button>
              {editingRouteId && (
                <button type="button" className="btn btn-secondary" onClick={() => { resetRouteForm(); setShowAddForm(false); }} style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <div className="routes-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Transport Routes</h3>
          <button onClick={() => setShowAddForm(true)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', width: 'fit-content' }}>
            + Add Route
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Start Point</th>
                <th>End Point</th>
                <th>Pickup Time</th>
                <th>Drop Time</th>
                <th>Vehicle</th>
                <th>Driver Name</th>
                <th>Driver Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route._id || route.id}>
                  <td>{route.routeName}</td>
                  <td>{route.startPoint?.name}</td>
                  <td>{route.endPoint?.name}</td>
                  <td>{route.pickupTime}</td>
                  <td>{route.dropTime}</td>
                  <td>{route.vehicle?.vehicleNumber}</td>
                  <td>{route.driver?.driverName}</td>
                  <td>{route.driver?.phone || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleEditRoute(route)} style={{ marginRight: '8px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteRoute(route._id || route.id)} className="btn-delete">
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

export default TransportManagement;
