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
    driver: { driverName: '' },
  });
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transport');
      setRoutes(response.data);
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
    setEditingRouteId(route._id);
    setNewRoute({
      routeName: route.routeName,
      startPoint: { name: route.startPoint?.name || '' },
      endPoint: { name: route.endPoint?.name || '' },
      pickupTime: route.pickupTime || '',
      dropTime: route.dropTime || '',
      vehicle: { vehicleNumber: route.vehicle?.vehicleNumber || '' },
      driver: { driverName: route.driver?.driverName || '' },
    });
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

      <form onSubmit={handleAddRoute} className="management-form">
        <h3>Add New Route</h3>
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
        <button type="submit">{editingRouteId ? 'Update Route' : 'Add Route'}</button>
        {editingRouteId && (
          <button type="button" onClick={resetRouteForm} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        )}
      </form>

      <div className="routes-list">
        <h3>Transport Routes</h3>
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
                <th>Driver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route._id}>
                  <td>{route.routeName}</td>
                  <td>{route.startPoint?.name}</td>
                  <td>{route.endPoint?.name}</td>
                  <td>{route.pickupTime}</td>
                  <td>{route.dropTime}</td>
                  <td>{route.vehicle?.vehicleNumber}</td>
                  <td>{route.driver?.driverName}</td>
                  <td>
                    <button onClick={() => handleEditRoute(route)} style={{ marginRight: '8px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteRoute(route._id)} className="btn-delete">
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
