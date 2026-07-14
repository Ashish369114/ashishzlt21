import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api, { schoolService, classService, studentService, complaintService } from '../../services/api';
import '../../styles/ManagementStyles.css';
import { formatCurrency } from '../../utils/currencyFormatter';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const userRole = localStorage.getItem('role');
  const isPrincipal = userRole === 'principal';
  const [schools, setSchools] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    school: '',
    employeeType: 'teaching',
    designation: '',
    dateOfJoining: '',
    employeeStatus: 'Working',
    salary: { baseSalary: 0, allowances: {}, deductions: {} },
  });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Sub-tabs state
  const [activeTab, setActiveTab] = useState('directory');
  const [payrollRole, setPayrollRole] = useState('teaching');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingEmployeePayroll, setEditingEmployeePayroll] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [viewingTeacherClasses, setViewingTeacherClasses] = useState(null); // employee object
  const [allClasses, setAllClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [assignClassId, setAssignClassId] = useState(''); // class to assign as class teacher
  const [classStudentsMap, setClassStudentsMap] = useState({}); // classId -> [student records]
  
  const [allComplaints, setAllComplaints] = useState([]);
  const [complaintsModalTeacher, setComplaintsModalTeacher] = useState(null);
  const [internalRemark, setInternalRemark] = useState('');
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);

  const fetchAllClasses = async () => {
    try {
      setClassesLoading(true);
      const res = await classService.getAll();
      setAllClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setClassesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchFormOptions();
    fetchAllClasses();
    fetchAllComplaints();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchAllComplaints = async () => {
    try {
      const res = await complaintService.getAll();
      setAllComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  };

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
      if (schoolsRes.data?.length > 0) {
        setNewEmployee(prev => ({ ...prev, school: schoolsRes.data[0]._id }));
      }
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

    socketRef.current = newSocket;

    newSocket.on('employee:deleted', (data) => {
      console.log('Employee deleted:', data);
      setEmployees(prev => prev.filter(emp => emp._id !== data.id));
    });

    setSocket(newSocket);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const key = name.split('.')[1];
      setNewEmployee({
        ...newEmployee,
        salary: {
          ...newEmployee.salary,
          [key]: key === 'baseSalary' ? Number(value) : value,
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
      employeeStatus: employee.status === 'terminated' || employee.status === 'inactive' ? 'Terminated' : employee.inNoticePeriod ? 'Serving Notice Period' : 'Working',
      salary: {
        baseSalary: employee.salary?.baseSalary || 0,
        allowances: employee.salary?.allowances || {},
        deductions: employee.salary?.deductions || {},
      },
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingEmployeeId(null);
    setShowAddForm(false);
    setAssignClassId('');
    setNewEmployee({
      firstName: '',
      lastName: '',
      school: '',
      employeeType: 'teaching',
      designation: '',
      dateOfJoining: '',
      employeeStatus: 'Working',
      salary: { baseSalary: 0, allowances: {}, deductions: {} },
    });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeePayload = {
        ...newEmployee,
        school: newEmployee.school || schools[0]?._id,
        status: newEmployee.employeeStatus === 'Terminated' ? 'terminated' : 'active',
        inNoticePeriod: newEmployee.employeeStatus === 'Serving Notice Period',
      };
      delete employeePayload.employeeStatus;
      let response;
      if (editingEmployeeId) {
        response = await api.put(`/employees/${editingEmployeeId}`, employeePayload);
      } else {
        response = await api.post('/employees', employeePayload);
      }

      // If a class was selected to assign this teacher as class teacher
      if (assignClassId) {
        await classService.update(assignClassId, { classTeacher: response.data?._id || response.data?.employee?._id });
        await fetchAllClasses(); // refresh class data
      }

      fetchEmployees();
      resetForm();
      setShowAddForm(false);
      if (!editingEmployeeId && response && response.data) {
        setEditingEmployeePayroll(response.data);
      } else {
        alert(editingEmployeeId ? 'Employee updated successfully!' : 'Employee added successfully!');
      }
    } catch (error) {
      console.error('Error saving employee:', error.response?.data || error.message);
      alert(`Error saving employee: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee');
      }
    }
  };

  const getYearsWorked = (joiningDate) => {
    if (!joiningDate) return '0.0';
    const joinDate = new Date(joiningDate);
    const diffTime = Math.abs(new Date() - joinDate);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return diffYears.toFixed(1);
  };

  // Filters and helpers for Payroll
  const isTeacher = (emp) => ['teaching', 'Pre-Primary', 'Junior School', 'High School'].includes(emp.employeeType);

  const teachingEmployees = employees.filter(isTeacher);
  const nonTeachingEmployees = employees.filter(emp => !isTeacher(emp));
  const filteredEmployees = employees.filter(emp => {
    if (!selectedTypeFilter) return false;
    if (selectedTypeFilter === 'teaching') return isTeacher(emp);
    if (selectedTypeFilter === 'Non-Teaching Staff') return !isTeacher(emp);
    return emp.employeeType === selectedTypeFilter;
  });

  // Payroll save handlers
  const handleSaveSalary = async (employeeId, salaryData) => {
    try {
      await api.put(`/employees/${employeeId}/salary`, salaryData);
      fetchEmployees();
      alert('Salary updated successfully!');
    } catch (error) {
      console.error('Error updating salary:', error);
      alert('Failed to update salary.');
    }
  };

  return (
    <div className="management-container">
      <h1>Employee Management</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        {isPrincipal && (
          <button
            className={`btn ${activeTab === 'payroll' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('payroll')}
            style={{ width: 'auto', margin: 0 }}
          >
            💼 Employee Payroll
          </button>
        )}
      </div>

      {activeTab === 'directory' && (
        <>
          {/* Category Selector Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
            <button
              onClick={() => {
                setSelectedTypeFilter('teaching');
                setNewEmployee(prev => ({ ...prev, employeeType: 'teaching' }));
                setEditingEmployeeId(null);
              }}
              style={{
                flex: 1,
                padding: '18px 24px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: selectedTypeFilter === 'teaching' ? '#4f46e5' : '#e5e7eb',
                background: selectedTypeFilter === 'teaching' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#fff',
                color: selectedTypeFilter === 'teaching' ? '#fff' : '#374151',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: selectedTypeFilter === 'teaching' ? '0 4px 20px rgba(79,70,229,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              📖 Teaching Staff
            </button>
            <button
              onClick={() => {
                setSelectedTypeFilter('Non-Teaching Staff');
                setNewEmployee(prev => ({ ...prev, employeeType: 'Non-Teaching Staff' }));
                setEditingEmployeeId(null);
              }}
              style={{
                flex: 1,
                padding: '18px 24px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: selectedTypeFilter === 'Non-Teaching Staff' ? '#4f46e5' : '#e5e7eb',
                background: selectedTypeFilter === 'Non-Teaching Staff' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#fff',
                color: selectedTypeFilter === 'Non-Teaching Staff' ? '#fff' : '#374151',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: selectedTypeFilter === 'Non-Teaching Staff' ? '0 4px 20px rgba(79,70,229,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              💼 Non-Teaching Staff
            </button>
          </div>

          {!selectedTypeFilter ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👆</div>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Select a staff category above to get started.</p>
            </div>
          ) : (
            <>
              {/* Add / Edit Employee Form Modal */}
              {showAddForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>{editingEmployeeId ? 'Update Employee' : `Add New ${selectedTypeFilter === 'teaching' ? 'Teaching' : 'Non-Teaching'} Staff`}</h3>
                      <button onClick={resetForm} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280', padding: '0 5px' }}>&times;</button>
                    </div>
                  <form onSubmit={handleAddEmployee} className="management-form" style={{ background: 'none', padding: 0, boxShadow: 'none', border: 'none' }}>
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
                <select
                  name="designation"
                  value={['', '__other__'].includes(newEmployee.designation) || [
                    'Pre-Primary Teacher','Pre-Primary Class Teacher',
                    'Primary School Teacher','Primary Class Teacher','Primary Subject Teacher',
                    'Middle School Teacher','Middle School Class Teacher','Middle School Subject Teacher',
                    'High School Teacher','High School Class Teacher','High School Subject Teacher',
                    'Senior Secondary Teacher','Senior Secondary Class Teacher','Senior Secondary Subject Teacher',
                    'Physical Education Teacher','Art & Craft Teacher','Music Teacher','Computer Science Teacher',
                    'Special Education Teacher','Librarian (Teaching)','Counsellor',
                    'Head of Department','Vice Principal','Principal',
                    'Administrative Officer','Office Assistant','Receptionist','Data Entry Operator',
                    'HR Manager','Accounts Officer','Accountant','Cashier',
                    'Peon','Attender','Security Guard','Sweeper / Housekeeping','Gardener','Driver','Cook / Canteen Staff',
                    'Lab Assistant','Library Assistant','IT Technician','Electrician','Plumber','Carpenter'
                  ].includes(newEmployee.designation) ? newEmployee.designation : '__other__'}
                  onChange={e => {
                    if (e.target.value === '__other__') {
                      handleInputChange({ target: { name: 'designation', value: '__other__' } });
                    } else {
                      handleInputChange(e);
                    }
                  }}
                  required={newEmployee.designation !== '__other__'}
                  style={{ padding: '14px 18px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', width: '100%', color: newEmployee.designation ? '#111827' : '#9ca3af', height: '52px' }}
                >
                  <option value="">— Select Designation —</option>
                  {selectedTypeFilter === 'teaching' ? (
                    <>
                      <optgroup label="Pre-Primary">
                        <option value="Pre-Primary Teacher">Pre-Primary Teacher</option>
                        <option value="Pre-Primary Class Teacher">Pre-Primary Class Teacher</option>
                      </optgroup>
                      <optgroup label="Primary School (Grades 1–5)">
                        <option value="Primary School Teacher">Primary School Teacher</option>
                        <option value="Primary Class Teacher">Primary Class Teacher</option>
                        <option value="Primary Subject Teacher">Primary Subject Teacher</option>
                      </optgroup>
                      <optgroup label="Middle School (Grades 6–8)">
                        <option value="Middle School Teacher">Middle School Teacher</option>
                        <option value="Middle School Class Teacher">Middle School Class Teacher</option>
                        <option value="Middle School Subject Teacher">Middle School Subject Teacher</option>
                      </optgroup>
                      <optgroup label="High School (Grades 9–10)">
                        <option value="High School Teacher">High School Teacher</option>
                        <option value="High School Class Teacher">High School Class Teacher</option>
                        <option value="High School Subject Teacher">High School Subject Teacher</option>
                      </optgroup>
                      <optgroup label="Senior Secondary (Grades 11–12)">
                        <option value="Senior Secondary Teacher">Senior Secondary Teacher</option>
                        <option value="Senior Secondary Class Teacher">Senior Secondary Class Teacher</option>
                        <option value="Senior Secondary Subject Teacher">Senior Secondary Subject Teacher</option>
                      </optgroup>
                      <optgroup label="Specialist Roles">
                        <option value="Physical Education Teacher">Physical Education Teacher</option>
                        <option value="Art & Craft Teacher">Art & Craft Teacher</option>
                        <option value="Music Teacher">Music Teacher</option>
                        <option value="Computer Science Teacher">Computer Science Teacher</option>
                        <option value="Special Education Teacher">Special Education Teacher</option>
                        <option value="Librarian (Teaching)">Librarian (Teaching)</option>
                        <option value="Counsellor">Counsellor</option>
                      </optgroup>
                      <optgroup label="Leadership">
                        <option value="Head of Department">Head of Department (HOD)</option>
                        <option value="Vice Principal">Vice Principal</option>
                        <option value="Principal">Principal</option>
                      </optgroup>
                      <optgroup label="Not in the list?">
                        <option value="__other__">✏️ Other — type your own designation</option>
                      </optgroup>
                    </>
                  ) : (
                    <>
                      <optgroup label="Administration">
                        <option value="Administrative Officer">Administrative Officer</option>
                        <option value="Office Assistant">Office Assistant</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Data Entry Operator">Data Entry Operator</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Accounts Officer">Accounts Officer</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Cashier">Cashier</option>
                      </optgroup>
                      <optgroup label="Support Staff">
                        <option value="Peon">Peon</option>
                        <option value="Attender">Attender</option>
                        <option value="Security Guard">Security Guard</option>
                        <option value="Sweeper / Housekeeping">Sweeper / Housekeeping</option>
                        <option value="Gardener">Gardener</option>
                        <option value="Driver">Driver</option>
                        <option value="Cook / Canteen Staff">Cook / Canteen Staff</option>
                      </optgroup>
                      <optgroup label="Technical">
                        <option value="Lab Assistant">Lab Assistant</option>
                        <option value="Library Assistant">Library Assistant</option>
                        <option value="IT Technician">IT Technician</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Carpenter">Carpenter</option>
                      </optgroup>
                      <optgroup label="Not in the list?">
                        <option value="__other__">✏️ Other — type your own designation</option>
                      </optgroup>
                    </>
                  )}
                </select>
                {newEmployee.designation === '__other__' && (
                  <input
                    type="text"
                    placeholder="✏️ Type your designation here..."
                    onChange={e => handleInputChange({ target: { name: 'designation', value: e.target.value || '__other__' } })}
                    required
                    autoFocus
                    style={{
                      marginTop: '8px', padding: '14px 18px', borderRadius: '8px',
                      border: '2px solid #6366f1', fontSize: '1rem', width: '100%',
                      outline: 'none', boxSizing: 'border-box',
                      background: '#f5f3ff', color: '#111827'
                    }}
                  />
                )}
                <input
                  type="date"
                  name="dateOfJoining"
                  value={newEmployee.dateOfJoining}
                  onChange={handleInputChange}
                  required
                />
                <select
                  name="employeeStatus"
                  value={newEmployee.employeeStatus}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '14px 18px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', width: '100%', color: '#111827', height: '52px' }}
                >
                  <option value="Working">Working</option>
                  <option value="Serving Notice Period">Serving Notice Period</option>
                  <option value="Terminated">Terminated</option>
                </select>
                {selectedTypeFilter === 'teaching' && (
                  <div style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>
                      🏫 Assign as Class Teacher (Optional)
                    </label>
                    <select
                      value={assignClassId}
                      onChange={e => setAssignClassId(e.target.value)}
                      style={{ padding: '14px 18px', borderRadius: '8px', border: '2px solid #e0e7ff', fontSize: '1rem', width: '100%', height: '52px', background: '#f5f3ff', color: assignClassId ? '#111827' : '#9ca3af' }}
                    >
                      <option value="">— No class assignment —</option>
                      {[...new Set(allClasses.map(c => c.grade))]
                        .sort((a, b) => a - b)
                        .map(grade => (
                          <optgroup key={grade} label={`Grade ${grade}`}>
                            {allClasses
                              .filter(c => c.grade === grade)
                              .sort((a, b) => a.section.localeCompare(b.section))
                              .map(cls => (
                                <option key={cls._id} value={cls._id}>
                                  Grade {cls.grade} – Section {cls.section}{cls.subject ? ` (${cls.subject})` : ''}
                                  {cls.classTeacher ? ` ✓ Already assigned` : ''}
                                </option>
                              ))}
                          </optgroup>
                        ))
                      }
                    </select>
                  </div>
                )}
                <button type="submit">
                  {editingEmployeeId ? 'Update Employee' : 'Add Employee'}
                </button>
                {editingEmployeeId && (
                  <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </form>
                  </div>
                </div>
              )}

              {/* Employees List */}
              <div className="employees-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>{selectedTypeFilter === 'teaching' ? '📖 Teaching Staff' : '💼 Non-Teaching Staff'} — Employees List</h3>
                  <button onClick={() => setShowAddForm(true)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                    + Add Employee
                  </button>
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : filteredEmployees.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No employees found in this category.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap' }}>Name</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Designation</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Base Salary</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Joining Date</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Remarks</th>
                        <th style={{ width: '180px', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee._id}>
                          <td>{employee.firstName} {employee.lastName}</td>
                          <td>{employee.designation}</td>
                          <td>{employee.employeeType}</td>
                          <td>{formatCurrency(employee.salary?.baseSalary || 0)}</td>
                          <td>{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
                          <td>
                            {employee.status === 'terminated' || employee.status === 'inactive' ? (
                               <span style={{ color: '#ef4444', fontWeight: '500', padding: '4px 8px', background: '#fee2e2', borderRadius: '4px', fontSize: '0.85rem' }}>Terminated</span>
                            ) : employee.inNoticePeriod ? (
                              <span style={{ color: '#d97706', fontWeight: '500', padding: '4px 8px', background: '#fef3c7', borderRadius: '4px', fontSize: '0.85rem' }}>Serving Notice Period</span>
                            ) : employee.remarks ? (
                              <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>{employee.remarks}</span>
                            ) : (
                              <span style={{ color: '#059669', fontWeight: '500', padding: '4px 8px', background: '#d1fae5', borderRadius: '4px', fontSize: '0.85rem' }}>Working</span>
                            )}
                          </td>
                          <td>
                            {selectedTypeFilter === 'teaching' && (
                              <button
                                onClick={async () => {
                                  setViewingTeacherClasses(employee);
                                  // Fetch students for all classes where this teacher is classTeacher
                                  try {
                                    const teacherName = `${employee.firstName} ${employee.lastName}`.toLowerCase().trim();
                                    const teacherClasses = allClasses.filter(cls => {
                                      const ct = cls.classTeacher;
                                      if (!ct) return false;
                                      const ctName = `${ct.firstName || ''} ${ct.lastName || ''}`.toLowerCase().trim();
                                      return ctName === teacherName || String(ct._id) === String(employee._id);
                                    });
                                    const map = {};
                                    await Promise.all(teacherClasses.map(async cls => {
                                      try {
                                        const res = await studentService.getByClass(cls._id);
                                        map[cls._id] = Array.isArray(res.data) ? res.data : [];
                                      } catch (e) { map[cls._id] = []; }
                                    }));
                                    setClassStudentsMap(map);
                                  } catch (e) { console.error('Error fetching class students:', e); }
                                }}
                                className="btn btn-small"
                                style={{ marginRight: '8px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                📚 Classes
                              </button>
                            )}
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
            </>
          )}

          {/* Remarks Modal */}
          {complaintsModalTeacher && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="modal-content" style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>📝 Remarks for {complaintsModalTeacher.firstName} {complaintsModalTeacher.lastName}</h2>
                  <button onClick={() => setComplaintsModalTeacher(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                </div>
                
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>Add Remark:</h4>
                    <textarea 
                      value={internalRemark} 
                      onChange={(e) => setInternalRemark(e.target.value)} 
                      placeholder="Type a new remark here..." 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', marginBottom: '12px', fontSize: '0.95rem', fontFamily: 'inherit' }}
                    />
                    <button 
                      onClick={async () => { 
                        if(!internalRemark) return; 
                        const existing = complaintsModalTeacher.remarks ? complaintsModalTeacher.remarks + '\n\n' : '';
                        const newRemarks = existing + `[${new Date().toLocaleDateString()}] ` + internalRemark;
                        // use 'updateSalary' endpoint since there's no generic update endpoint exposed, or we can use generic update if available
                        // Wait, api.js has 'updateSalary' but let's see if generic update exists. If not, I'll need to use what's there.
                        // I'll assume we can use the regular api put call directly if needed, but wait, employeeService has update!
                        // Let me check what's in api.js for employees.
                        // I will add a generic update to api.js if it's missing, but for now I'll write the logic.
                        // Actually, I can just use employee API directly: await api.put(`/employees/${complaintsModalTeacher._id}`, { remarks: newRemarks });
                        try {
                          await api.put(`/employees/${complaintsModalTeacher._id}`, { remarks: newRemarks });
                          setInternalRemark('');
                          setComplaintsModalTeacher({ ...complaintsModalTeacher, remarks: newRemarks });
                          fetchEmployees();
                        } catch (error) {
                          console.error("Error saving remark:", error);
                        }
                      }} 
                      className="btn btn-primary" style={{ width: '100%' }}
                    >
                      Save Remark
                    </button>
                  </div>
                  
                  {complaintsModalTeacher.remarks ? (
                    <div style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>History of Remarks:</h4>
                      {complaintsModalTeacher.remarks}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                      No remarks have been added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Teacher Classes Modal */}
          {viewingTeacherClasses && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '20px'
            }}>
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '28px',
                width: '100%', maxWidth: '700px', maxHeight: '85vh',
                overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                fontFamily: 'sans-serif', color: '#1f2937'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                      📚 {viewingTeacherClasses.firstName} {viewingTeacherClasses.lastName}'s Classes
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
                      {viewingTeacherClasses.designation} &mdash; Teaching Staff
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingTeacherClasses(null)}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}
                  >✕</button>
                </div>

                {classesLoading ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>Loading classes…</p>
                ) : (() => {
                  const teacherName = `${viewingTeacherClasses.firstName} ${viewingTeacherClasses.lastName}`.toLowerCase().trim();
                  const teacherClasses = allClasses.filter(cls => {
                    const ct = cls.classTeacher;
                    if (!ct) return false;
                    const ctName = `${ct.firstName || ''} ${ct.lastName || ''}`.toLowerCase().trim();
                    return ctName === teacherName || String(ct._id) === String(viewingTeacherClasses._id);
                  });

                  if (teacherClasses.length === 0) return (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                      <p style={{ fontWeight: 500 }}>No classes assigned to this teacher yet.</p>
                      <p style={{ fontSize: '0.85rem' }}>Go to the Classes page to assign this teacher as a Class Teacher.</p>
                    </div>
                  );

                  return teacherClasses.map(cls => (
                    <div key={cls._id} style={{
                      background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
                      padding: '18px 20px', marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff',
                          borderRadius: '10px', padding: '8px 16px', fontWeight: 800, fontSize: '1rem'
                        }}>
                          Grade {cls.grade} — Section {cls.section}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          Subject: <strong>{cls.subject || 'General'}</strong>
                        </div>
                        <div style={{
                          marginLeft: 'auto', background: '#dcfce7', color: '#15803d',
                          borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          👥 {cls.students?.length || 0} Students
                        </div>
                      </div>

                      {cls.students && cls.students.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#e0e7ff' }}>
                              <th style={{ padding: '8px 10px', textAlign: 'left', width: '36px' }}>#</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Name</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Roll No.</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Student ID</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Parent / Guardian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cls.students.map((student, idx) => {
                              const userId = student._id || student;
                              const enriched = (classStudentsMap[cls._id] || []).find(s =>
                                String(s.userId?._id || s.userId) === String(userId)
                              );
                              const name = student.firstName
                                ? `${student.firstName} ${student.lastName || ''}`
                                : enriched?.userId?.firstName
                                  ? `${enriched.userId.firstName} ${enriched.userId.lastName || ''}`
                                  : '—';
                              const rollNo = enriched?.rollNumber || '—';
                              const studentId = enriched?.userId?.userId || enriched?._id?.slice(-6).toUpperCase() || '—';
                              const parentName = enriched?.parentId
                                ? `${enriched.parentId.firstName || ''} ${enriched.parentId.lastName || ''}`.trim() || '—'
                                : '—';
                              return (
                                <tr key={userId || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <td style={{ padding: '8px 10px', color: '#6b7280' }}>{idx + 1}</td>
                                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{name}</td>
                                  <td style={{ padding: '8px 10px', color: '#4b5563' }}>{rollNo}</td>
                                  <td style={{ padding: '8px 10px', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>{studentId}</td>
                                  <td style={{ padding: '8px 10px', color: '#4b5563' }}>{parentName}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '8px 0 0' }}>No students enrolled in this class yet.</p>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'payroll' && isPrincipal && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Payroll Type:</label>
            <select
              value={payrollRole}
              onChange={e => setPayrollRole(e.target.value)}
              className="select"
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            >
              <option value="teaching">📖 Teaching Staff Payroll</option>
              <option value="non_teaching">💼 Non-Teaching Staff Payroll</option>
            </select>
          </div>

          {payrollRole === 'teaching' ? (
            <div className="employees-list">
              <h3>Teaching Staff Payroll</h3>
              <table>
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Subject / Role</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Experience</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Base Salary</th>
                    <th style={{ width: '150px', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachingEmployees.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>{teacher.firstName} {teacher.lastName}</td>
                      <td>{teacher.subject?.name || teacher.subject || (teacher.designation ? teacher.designation.split(' ')[0] : '—')}</td>
                      <td>{(() => {
                        if (!teacher.designation) return '—';
                        const parts = teacher.designation.split(' ');
                        if (parts.length === 1) {
                          if (parts[0] === 'PGT') return 'Post Graduate Teacher';
                          if (parts[0] === 'TGT') return 'Trained Graduate Teacher';
                          return parts[0];
                        }
                        const rest = parts.slice(1).join(' ');
                        if (rest === 'PGT' || rest === 'PGT Teacher') {
                          return 'Post Graduate Teacher';
                        }
                        if (rest === 'TGT' || rest === 'TGT Teacher') {
                          return 'Trained Graduate Teacher';
                        }
                        return rest;
                      })()}</td>
                      <td>{getYearsWorked(teacher.dateOfJoining)} yrs</td>
                      <td>{formatCurrency(teacher.salary?.baseSalary || 0)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setEditingTeacher(teacher)}
                          className="btn btn-primary btn-small"
                        >
                          💼 Set Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="employees-list">
              <h3>Non-Teaching Staff Payroll</h3>
              <table>
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Designation</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Experience</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Joining Date</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Base Salary</th>
                    <th style={{ width: '150px', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {nonTeachingEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.designation}</td>
                      <td>{getYearsWorked(emp.dateOfJoining)} yrs</td>
                      <td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
                      <td>{formatCurrency(emp.salary?.baseSalary || 0)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setEditingEmployeePayroll(emp)}
                          className="btn btn-primary btn-small"
                        >
                          💼 Set Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Salary Modals */}
      {editingTeacher && (
        <SalaryModal
          employee={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onSave={(salaryData) => {
            handleSaveSalary(editingTeacher._id, salaryData);
            setEditingTeacher(null);
          }}
        />
      )}

      {editingEmployeePayroll && (
        <SalaryModal
          employee={editingEmployeePayroll}
          onClose={() => setEditingEmployeePayroll(null)}
          onSave={(salaryData) => {
            handleSaveSalary(editingEmployeePayroll._id, salaryData);
            setEditingEmployeePayroll(null);
          }}
        />
      )}
    </div>
  );
};

// Internal reusable Salary Modal
const SalaryModal = ({ employee, onClose, onSave }) => {
  const [baseSalary, setBaseSalary] = useState(employee.salary?.baseSalary || 0);
  const [allowanceName, setAllowanceName] = useState('');
  const [allowanceVal, setAllowanceVal] = useState(0);
  const [allowances, setAllowances] = useState(employee.salary?.allowances || {});

  const [deductionName, setDeductionName] = useState('');
  const [deductionVal, setDeductionVal] = useState(0);
  const [deductions, setDeductions] = useState(employee.salary?.deductions || {});

  const handleAddAllowance = () => {
    if (!allowanceName.trim()) return;
    setAllowances(prev => ({ ...prev, [allowanceName]: Number(allowanceVal) }));
    setAllowanceName('');
    setAllowanceVal(0);
  };

  const handleRemoveAllowance = (key) => {
    setAllowances(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleAddDeduction = () => {
    if (!deductionName.trim()) return;
    setDeductions(prev => ({ ...prev, [deductionName]: Number(deductionVal) }));
    setDeductionName('');
    setDeductionVal(0);
  };

  const handleRemoveDeduction = (key) => {
    setDeductions(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ baseSalary: Number(baseSalary), allowances, deductions });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ marginBottom: '16px' }}>💰 Set Pay for {employee.firstName} {employee.lastName}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Base Salary</label>
            <input
              type="number"
              value={baseSalary}
              onChange={e => setBaseSalary(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Allowances section */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>🎁 Allowances</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g. TA"
                  value={allowanceName}
                  onChange={e => setAllowanceName(e.target.value)}
                  style={{ flex: 2, padding: '5px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
                <input
                  type="number"
                  placeholder="₹"
                  value={allowanceVal}
                  onChange={e => setAllowanceVal(e.target.value)}
                  style={{ flex: 1, padding: '5px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
                <button type="button" onClick={handleAddAllowance} style={{ padding: '5px 8px', borderRadius: '4px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>+</button>
              </div>
              <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '0.84rem' }}>
                {Object.entries(allowances).map(([k, v]) => (
                  <li key={k} style={{ marginBottom: '4px' }}>
                    {k}: {formatCurrency(v)} <span onClick={() => handleRemoveAllowance(k)} style={{ color: 'red', cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold' }}>×</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deductions section */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>💸 Deductions</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g. Tax"
                  value={deductionName}
                  onChange={e => setDeductionName(e.target.value)}
                  style={{ flex: 2, padding: '5px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
                <input
                  type="number"
                  placeholder="₹"
                  value={deductionVal}
                  onChange={e => setDeductionVal(e.target.value)}
                  style={{ flex: 1, padding: '5px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
                <button type="button" onClick={handleAddDeduction} style={{ padding: '5px 8px', borderRadius: '4px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>+</button>
              </div>
              <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '0.84rem' }}>
                {Object.entries(deductions).map(([k, v]) => (
                  <li key={k} style={{ marginBottom: '4px' }}>
                    {k}: {formatCurrency(v)} <span onClick={() => handleRemoveDeduction(k)} style={{ color: 'red', cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold' }}>×</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">Save Salary Details</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeManagement;
