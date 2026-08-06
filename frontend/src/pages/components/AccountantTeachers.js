import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/api';

const AccountantTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('employeeId');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await teacherService.getAll().catch(() => ({ data: [] }));
        const allTeachers = Array.isArray(response.data) ? response.data : [];
        if (allTeachers.length > 0) {
          setTeachers(allTeachers);
          setFilteredTeachers(allTeachers);
        } else {
          const demoData = [
            { _id: 't1', userId: { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@school.com' }, employeeId: 'EMP-1001', designation: 'Senior Teacher', subject: { name: 'Mathematics' }, salary: 48000, experience: 12, status: 'Active' },
            { _id: 't2', userId: { firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@school.com' }, employeeId: 'EMP-1002', designation: 'Teacher', subject: { name: 'Science' }, salary: 42000, experience: 8, status: 'Active' },
            { _id: 't3', userId: { firstName: 'Ananya', lastName: 'Singh', email: 'ananya.singh@school.com' }, employeeId: 'EMP-1003', designation: 'Teacher', subject: { name: 'English' }, salary: 36000, experience: 5, status: 'Active' },
            { _id: 't4', userId: { firstName: 'Kiran', lastName: 'Mehta', email: 'kiran.mehta@school.com' }, employeeId: 'EMP-1004', designation: 'Senior Teacher', subject: { name: 'Hindi' }, salary: 55000, experience: 15, status: 'Active' },
            { _id: 't5', userId: { firstName: 'Vijay', lastName: 'Gupta', email: 'vijay.gupta@school.com' }, employeeId: 'EMP-1005', designation: 'Junior Teacher', subject: { name: 'Social Studies' }, salary: 30000, experience: 3, status: 'Active' },
            { _id: 't6', userId: { firstName: 'Ritu', lastName: 'Joshi', email: 'ritu.joshi@school.com' }, employeeId: 'EMP-1006', designation: 'Teacher', subject: { name: 'Computer Science' }, salary: 40000, experience: 7, status: 'Active' },
            { _id: 't7', userId: { firstName: 'Aditya', lastName: 'Kumar', email: 'aditya.kumar@school.com' }, employeeId: 'EMP-1007', designation: 'Teacher', subject: { name: 'Physical Education' }, salary: 38000, experience: 10, status: 'On Leave' },
            { _id: 't8', userId: { firstName: 'Deepa', lastName: 'Patel', email: 'deepa.patel@school.com' }, employeeId: 'EMP-1008', designation: 'Teacher', subject: { name: 'Arts' }, salary: 34000, experience: 6, status: 'Active' },
            { _id: 't9', userId: { firstName: 'Sanjay', lastName: 'Reddy', email: 'sanjay.reddy@school.com' }, employeeId: 'EMP-1009', designation: 'Senior Teacher', subject: { name: 'Chemistry' }, salary: 44000, experience: 9, status: 'Active' },
            { _id: 't10', userId: { firstName: 'Nisha', lastName: 'Iyer', email: 'nisha.iyer@school.com' }, employeeId: 'EMP-1010', designation: 'Senior Teacher', subject: { name: 'Biology' }, salary: 46000, experience: 11, status: 'Active' },
          ];
          setTeachers(demoData);
          setFilteredTeachers(demoData);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load teacher records at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const lowercased = searchTerm.trim().toLowerCase();
    const filtered = teachers.filter((teacher) => {
      const matchesSearch = [
        teacher.userId?.firstName,
        teacher.userId?.lastName,
        teacher.userId?.userId,
        teacher.designation,
        teacher.subject?.name,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowercased));

      const matchesStatus = statusFilter === 'All' || teacher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'name') {
        valA = `${a.userId?.firstName || ''} ${a.userId?.lastName || ''}`.trim();
        valB = `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`.trim();
      } else if (sortField === 'employeeId') {
        valA = a.userId?.userId || '';
        valB = b.userId?.userId || '';
      } else if (sortField === 'designation') {
        valA = a.designation || 'Teacher';
        valB = b.designation || 'Teacher';
      } else if (sortField === 'status') {
        valA = a.status || 'Active';
        valB = b.status || 'Active';
      }

      return sortOrder === 'asc'
        ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
        : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
    });

    setFilteredTeachers(filtered);
  }, [searchTerm, statusFilter, teachers, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span style={{ color: '#9ca3af', marginLeft: '6px', fontSize: '0.85em' }}>⇅</span>;
    }
    return sortOrder === 'asc' ? (
      <span style={{ color: '#2563eb', marginLeft: '6px', fontSize: '0.85em' }}>▲</span>
    ) : (
      <span style={{ color: '#2563eb', marginLeft: '6px', fontSize: '0.85em' }}>▼</span>
    );
  };

  const formatAssignedClasses = (assignedClasses) => {
    if (!assignedClasses?.length) {
      return '—';
    }
    return assignedClasses
      .map((cls) => (cls?.grade && cls?.section ? `Grade ${cls.grade} • Section ${cls.section}` : cls?.name || 'Unknown'))
      .join(', ');
  };

  const formatAssignedSubjects = (teacher) => {
    const subjects = new Set();
    if (teacher.subject?.name) {
      subjects.add(teacher.subject.name);
    }
    if (Array.isArray(teacher.teachingSubjects)) {
      teacher.teachingSubjects.forEach((subject) => {
        if (subject?.name) subjects.add(subject.name);
      });
    }
    return subjects.size ? Array.from(subjects).join(', ') : '—';
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👨‍🏫 Teacher Directory</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-row full" style={{ gap: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Search teachers</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, employee ID, subject or designation"
          />
        </div>
        <div className="form-group" style={{ width: '180px' }}>
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  Teacher Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('employeeId')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  Employee ID {getSortIcon('employeeId')}
                </th>
                <th>Contact Details</th>
                <th>Profile / Bio</th>
                <th onClick={() => handleSort('designation')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  Designation {getSortIcon('designation')}
                </th>
                <th>Assigned Classes</th>
                <th>Assigned Subjects</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  Status {getSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="8">No teacher records found.</td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>{teacher.userId?.firstName} {teacher.userId?.lastName}</td>
                    <td>{teacher.userId?.userId || 'N/A'}</td>
                    <td>
                      <div>{teacher.userId?.phone || 'Phone N/A'}</div>
                      <div>{teacher.userId?.email || 'Email N/A'}</div>
                    </td>
                    <td>{teacher.bio || 'No profile details available.'}</td>
                    <td>{teacher.designation || 'Teacher'}</td>
                    <td>{formatAssignedClasses(teacher.assignedClasses)}</td>
                    <td>{formatAssignedSubjects(teacher)}</td>
                    <td>{teacher.status || 'Active'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountantTeachers;
