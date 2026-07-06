import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api, { schoolService } from '../../services/api';
import '../../styles/ManagementStyles.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [schools, setSchools] = useState([]);
  const [socket, setSocket] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    school: '',
    employeeType: 'staff',
    designation: '',
    dateOfJoining: '',
    salary: { baseSalary: 0, allowances: {}, deductions: {} },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchFormOptions();
    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [schoolsRes] = await Promise.all([
        schoolService.getAll(),
      ]);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error('Error fetching form options:', error);
    }
  };

  const setupSocket = () => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      const userId = localStorage.getItem('userId');
      const schoolId = localStorage.getItem('schoolId');
      newSocket.emit('user:authenticate', {
        userId,
        schoolId,
        role: localStorage.getItem('role'),
        name: localStorage.getItem('userName'),
      });
    });

    // Real-time Employee Updates
    newSocket.on('employee:added', (data) => {
      console.log('New employee added:', data);
      setEmployees(prev => [...prev, data]);
    });

    newSocket.on('employee:updated', (data) => {
      console.log('Employee updated:', data);
      setEmployees(prev =>
        prev.map(emp => emp._id === data._id ? data : emp)
      );
    });

    newSocket.on('employee:deleted', (data) => {
      console.log('Employee deleted:', data);
      setEmployees(prev => prev.filter(emp => emp._id !== data.id));
    });

    setSocket(newSocket);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('salary')) {
      setNewEmployee({
        ...newEmployee,
        salary: {
          ...newEmployee.salary,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      setNewEmployee({ ...newEmployee, [name]: value });
    }
  };

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const handleEditEmployee = (employee) => {
    setEditingEmployeeId(employee._id);
    setNewEmployee({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      school: employee.school?._id || employee.school || '',
      employeeType: employee.employeeType || 'staff',
      designation: employee.designation || '',
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
      salary: {
        baseSalary: employee.salary?.baseSalary || 0,
        allowances: employee.salary?.allowances || {},
        deductions: employee.salary?.deductions || {},
      },
    });
  };

  const resetForm = () => {
    setEditingEmployeeId(null);
    setNewEmployee({
      firstName: '',
      lastName: '',
      school: '',
      employeeType: 'staff',
      designation: '',
      dateOfJoining: '',
      salary: { baseSalary: 0, allowances: {}, deductions: {} },
    });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployeeId) {
        const response = await api.put(`/employees/${editingEmployeeId}`, newEmployee);
        if (socket) {
          socket.emit('employee:updated', response.data);
        }
      } else {
        const response = await api.post('/employees', newEmployee);
        if (socket) {
          socket.emit('employee:added', response.data);
        }
      }
      fetchEmployees();
      resetForm();
      alert(editingEmployeeId ? 'Employee updated successfully!' : 'Employee added successfully!');
    } catch (error) {
      console.error('Error saving employee:', error.response?.data || error.message);
      alert(`Error saving employee: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/employees/${id}`);
        if (socket) {
          socket.emit('employee:deleted', { id });
        }
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee');
      }
    }
  };

  return (
    <div className="management-container">
      <h1>Employee Management</h1>

      <form onSubmit={handleAddEmployee} className="management-form">
        <h3>Add New Employee</h3>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={newEmployee.firstName}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={newEmployee.lastName}
          onChange={handleInputChange}
          required
        />
        <select name="employeeType" value={newEmployee.employeeType} onChange={handleInputChange}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          <option value="support">Support</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          name="school"
          value={newEmployee.school}
          onChange={handleInputChange}
          required
        >
          <option value="">Select School</option>
          {schools.map((school) => (
            <option key={school._id} value={school._id}>{school.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={newEmployee.designation}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="dateOfJoining"
          value={newEmployee.dateOfJoining}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="salary.baseSalary"
          placeholder="Base Salary"
          value={newEmployee.salary.baseSalary}
          onChange={handleInputChange}
          required
        />
        <button type="submit">
          {editingEmployeeId ? 'Update Employee' : 'Add Employee'}
        </button>
        {editingEmployeeId && (
          <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <div className="employees-list">
        <h3>Employees List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Base Salary</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.firstName} {employee.lastName}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.employeeType}</td>
                  <td>₹{employee.salary?.baseSalary || 0}</td>
                  <td>{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEditEmployee(employee)} className="btn btn-secondary btn-small" style={{ marginRight: '8px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteEmployee(employee._id)} className="btn-delete">
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

export default EmployeeManagement;
