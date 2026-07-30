import React, { useState, useEffect } from 'react';
import { feeService, classService, studentService } from '../../services/api';
import { demoFees, demoStudents, demoClasses } from '../../utils/demoData';

const initialFormData = {
  student: '',
  amount: '',
  description: 'Annual Tuition Fees',
  dueDate: '',
  installments: 3,
};

const FeeManagement = ({ user }) => {
  const [fees, setFees] = useState([]);
  const [selectedStudentFees, setSelectedStudentFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const userRole = user?.role || JSON.parse(localStorage.getItem('user') || '{}').role;
  const isAccountant = userRole === 'accountant';

  const [editForm, setEditForm] = useState({
    amount: '',
    installments: '3',
    paidAmount: '',
    pendingAmount: '',
    paymentMethod: '',
  });

  useEffect(() => {
    fetchFees();
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!classes.length) return;
    if (!selectedGrade) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudent('');
      return;
    }

    const gradeClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
    const sections = [...new Set(gradeClasses.map((cls) => cls.section).filter(Boolean))].sort();
    if (!sections.length) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudent('');
      return;
    }

    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudent('');
      return;
    }

    const matchedClass = gradeClasses.find((cls) => String(cls.section) === String(selectedSection));
    setSelectedClassId(matchedClass?._id || matchedClass?.id || '');
    setSelectedStudent('');
  }, [classes, selectedGrade, selectedSection]);

  useEffect(() => {
    if (!selectedStudent) {
      // If no student is selected but we have a section, load all fees for the section
      if (!selectedClassId) {
        setSelectedStudentFees([]);
        return;
      }
      // Load section fees when section is selected
      let isCancelled = false;
      const loadSectionFees = async () => {
        try {
          const response = await feeService.getBySection(selectedClassId);
          if (!isCancelled) {
            // Convert section students to fee-like objects for compatibility
            setSelectedStudentFees(response.data || []);
          }
        } catch (err) {
          if (!isCancelled) {
            console.error('Failed to fetch section fees', err);
            setSelectedStudentFees([]);
          }
        }
      };
      loadSectionFees();
      return () => {
        isCancelled = true;
      };
    }

    let isCancelled = false;

    const loadStudentFees = async () => {
      try {
        const response = await feeService.getByStudent(selectedStudent);
        if (!isCancelled) {
          setSelectedStudentFees(response.data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to fetch fee details for selected student', err);
          setSelectedStudentFees([]);
        }
      }
    };

    loadStudentFees();

    return () => {
      isCancelled = true;
    };
  }, [selectedStudent, selectedClassId]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeService.getAll();
      setFees((response.data && response.data.length) ? response.data : demoFees);
      setError('');
    } catch (err) {
      console.warn('Using demo fees:', err);
      setFees(demoFees);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents((response.data && response.data.length) ? response.data : demoStudents);
    } catch (err) {
      console.warn('Using demo students in fees:', err);
      setStudents(demoStudents);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses((response.data && response.data.length) ? response.data : demoClasses);
    } catch (err) {
      console.warn('Using demo classes in fees:', err);
      setClasses(demoClasses);
    }
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const getStudentName = (student) => {
    const firstName = student?.userId?.firstName || student?.firstName || '';
    const lastName = student?.userId?.lastName || student?.lastName || '';
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name || 'Unknown Student';
  };

  const getStudentIdentifier = (student) => student?.userId?._id || student?.userId || student?._id || '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFeeForm = () => {
    setFormData(initialFormData);
    setEditingFeeId(null);
    setShowForm(false);
    setError('');
  };

  const resetEditForm = () => {
    setEditingFeeId(null);
    setEditForm({
      amount: '',
      installments: '3',
      paidAmount: '',
      pendingAmount: '',
      paymentMethod: '',
    });
  };

  const handleEditFee = (fee) => {
    const amount = Number(fee.amount || 0);
    const paidAmount = Number(fee.paidAmount || 0);
    const pendingAmount = Math.max(amount - paidAmount, 0);

    setEditingFeeId(fee._id);
    setEditForm({
      amount: String(amount),
      installments: String(fee.installments || 3),
      paidAmount: String(paidAmount),
      pendingAmount: String(pendingAmount),
      paymentMethod: fee.paymentMethod || '',
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'amount' && value !== '') {
        const amount = Number(value);
        const paidAmount = Number(next.paidAmount || 0);
        next.pendingAmount = String(Math.max(amount - paidAmount, 0));
      } else if (name === 'paidAmount' && value !== '') {
        const amount = Number(next.amount || 0);
        const paidAmount = Number(value);
        next.pendingAmount = String(Math.max(amount - paidAmount, 0));
      } else if (name === 'pendingAmount' && value !== '') {
        const amount = Number(next.amount || 0);
        const pendingAmount = Number(value);
        next.paidAmount = String(Math.max(amount - pendingAmount, 0));
      }

      return next;
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingFeeId) return;

    try {
      const payload = {
        amount: Number(editForm.amount || 0),
        installments: Number(editForm.installments || 3),
        paidAmount: Number(editForm.paidAmount || 0),
        paymentMethod: editForm.paymentMethod,
        isPaid: Number(editForm.paidAmount || 0) >= Number(editForm.amount || 0),
      };

      await feeService.update(editingFeeId, payload);
      resetEditForm();
      fetchFees();
      if (selectedStudent) {
        const response = await feeService.getByStudent(selectedStudent);
        setSelectedStudentFees(response.data || []);
      }
    } catch (err) {
      setError('Failed to update fee');
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student for the fee record.');
      return;
    }

    try {
      const payload = {
        ...formData,
        student: selectedStudent,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        installments: Number(formData.installments) || 3,
      };

      if (editingFeeId) {
        await feeService.update(editingFeeId, payload);
      } else {
        await feeService.add(payload);
      }

      resetFeeForm();
      fetchFees();
      if (selectedStudent) {
        const response = await feeService.getByStudent(selectedStudent);
        setSelectedStudentFees(response.data || []);
      }
    } catch (err) {
      setError(editingFeeId ? 'Failed to update fee' : 'Failed to add fee');
    }
  };

  const handleDeleteStudentFees = async (studentId) => {
    if (window.confirm('Are you sure you want to delete all fee records for this student?')) {
      try {
        await feeService.deleteByStudent(studentId);
        setSelectedStudent('');
        setSelectedStudentFees([]);
        resetEditForm();
        fetchFees();
      } catch (err) {
        setError('Failed to delete fee records');
      }
    }
  };


  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClasses = selectedGrade ? classes.filter((cls) => String(cls.grade) === String(selectedGrade)) : [];
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const sectionStudents = selectedClassId
    ? students.filter((student) => {
        const studentClassId = student.class?._id || student.class || student.classId;
        return String(studentClassId) === String(selectedClassId);
      })
    : [];
  const selectedStudentRecord = sectionStudents.find((student) => String(getStudentIdentifier(student)) === String(selectedStudent)) || null;
  
  // Handle both fee objects and student summary objects
  const isStudentSummaryData = Array.isArray(selectedStudentFees) && selectedStudentFees.length > 0 && selectedStudentFees[0].totalFee !== undefined;
  const selectedFee = selectedStudent && selectedStudentFees.length
    ? isStudentSummaryData
      ? // Student summary data - find the matching student
        selectedStudentFees.find((data) => String(data.studentId) === String(selectedStudent))
      : // Fee data - find the latest fee
        selectedStudentFees.reduce((latest, current) => {
          const latestDate = new Date(latest.updatedAt || latest.createdAt || 0);
          const currentDate = new Date(current.updatedAt || current.createdAt || 0);
          return currentDate > latestDate ? current : latest;
        }, selectedStudentFees[0])
    : null;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>💰 Fee Management</h2>
        {isAccountant && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '➕ Add Fee'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        <div className="form-row">
          <div className="form-group">
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection('');
                setSelectedClassId('');
                setSelectedStudent('');
              }}
            >
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedGrade || !sectionsForGrade.length}
            >
              <option value="">Select section</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setEditingFeeId(null);
              }}
              disabled={!selectedClassId || !sectionStudents.length}
            >
              <option value="">Select student</option>
              {sectionStudents.map((student) => {
                const studentId = getStudentIdentifier(student);
                return (
                  <option key={student._id} value={studentId}>
                    {getStudentName(student)} ({student.rollNumber})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        {selectedGrade && !selectedSection && (
          <div className="alert alert-success" style={{ marginTop: '10px' }}>
            Select a section to view students and fee details for Grade {selectedGrade}.
          </div>
        )}
      </div>

      {/* Section and Grade Student List */}
      {selectedGrade && selectedSection && !selectedStudent && (
        <div className="form-container" style={{ marginBottom: '20px', maxWidth: 'none' }}>
          <h3>📚 Students in Grade {selectedGrade} - Section {selectedSection}</h3>
          {sectionStudents.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Total Fee</th>
                    <th>Paid Amount</th>
                    <th>Pending Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionStudents.map((student) => {
                    const studentId = getStudentIdentifier(student);
                    // Check if selectedStudentFees contains section data (with totalFee property)
                    const studentData = Array.isArray(selectedStudentFees) && selectedStudentFees.length > 0 && selectedStudentFees[0].totalFee !== undefined
                      ? selectedStudentFees.find((data) => String(data.studentId) === String(studentId))
                      : null;

                    let totalFee, totalPaid, totalPending, allPaid;
                    
                    if (studentData) {
                      // Using data from getBySection endpoint
                      totalFee = studentData.totalFee || 0;
                      totalPaid = studentData.totalPaid || 0;
                      totalPending = studentData.totalPending || 0;
                      allPaid = studentData.isPaid;
                    } else {
                      // Fallback to calculating from individual fees
                      const studentFees = Array.isArray(selectedStudentFees) && selectedStudentFees[0]?.amount !== undefined
                        ? selectedStudentFees.filter((fee) =>
                            String(fee.student._id || fee.student) === String(studentId)
                          )
                        : [];
                      totalFee = studentFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
                      totalPaid = studentFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
                      totalPending = totalFee - totalPaid;
                      allPaid = totalFee > 0 && totalPending <= 0;
                    }

                    return (
                      <tr key={student._id} style={{ backgroundColor: allPaid ? '#e8f5e9' : totalPending > 0 ? '#fff3e0' : '#fff' }}>
                        <td>{student.rollNumber || '-'}</td>
                        <td>{getStudentName(student)}</td>
                        <td>{formatCurrency(totalFee)}</td>
                        <td>{formatCurrency(totalPaid)}</td>
                        <td>{formatCurrency(totalPending)}</td>
                        <td>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85em',
                              fontWeight: 'bold',
                              backgroundColor: allPaid ? '#4caf50' : totalPending > 0 ? '#ff9800' : '#9e9e9e',
                              color: '#fff',
                            }}
                          >
                            {allPaid ? '✓ Paid' : totalPending > 0 ? '⚠ Pending' : '-'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-small"
                            onClick={() => setSelectedStudent(studentId)}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-warning">No students found in this section.</div>
          )}
        </div>
      )}

      {isAccountant && showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingFeeId ? 'Update Fee' : 'Add New Fee'}</h3>
          <form onSubmit={handleAddFee}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedClassId}
                  required
                >
                  <option value="">Select student</option>
                  {sectionStudents.map((student) => {
                    const studentId = getStudentIdentifier(student);
                    return (
                      <option key={student._id} value={studentId}>
                        {getStudentName(student)} ({student.rollNumber})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Fee Type / Description</label>
                <select
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Annual Tuition Fees">Annual Tuition Fees</option>
                  <option value="Pocket Money">Pocket Money</option>
                  <option value="Caution Deposit">Caution Deposit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Fee</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Installments</label>
                <input
                  type="number"
                  name="installments"
                  min="1"
                  value={formData.installments}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">{editingFeeId ? 'Update Fee' : 'Add Fee'}</button>
            {editingFeeId && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetFeeForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          {selectedGrade && selectedSection && (
            <>
              {selectedStudent ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Total Fee</th>
                        <th>Installments</th>
                        <th>Pending Amount</th>
                        <th>Paid Amount</th>
                        <th>Payment Method</th>
                        {isAccountant && (
                          <>
                            <th>Edit</th>
                            <th>Delete</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFee ? (
                        <tr>
                          <td>{getStudentName(selectedStudentRecord)}</td>
                          {editingFeeId === selectedFee._id ? (
                            <>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  name="amount"
                                  value={editForm.amount}
                                  onChange={handleEditInputChange}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  name="installments"
                                  value={editForm.installments}
                                  onChange={handleEditInputChange}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  name="pendingAmount"
                                  value={editForm.pendingAmount}
                                  onChange={handleEditInputChange}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  name="paidAmount"
                                  value={editForm.paidAmount}
                                  onChange={handleEditInputChange}
                                />
                              </td>
                              <td>
                                <select
                                  name="paymentMethod"
                                  value={editForm.paymentMethod}
                                  onChange={handleEditInputChange}
                                >
                                  <option value="">Select method</option>
                                  <option value="PhonePe">PhonePe</option>
                                  <option value="Credit Card">Credit Card</option>
                                  <option value="Debit Card">Debit Card</option>
                                  <option value="Cash">Cash</option>
                                  <option value="Cheque">Cheque</option>
                                </select>
                              </td>
                              <td colSpan="2">
                                <div className="action-buttons">
                                  <button className="btn btn-success btn-small" onClick={handleSaveEdit}>Save</button>
                                  <button className="btn btn-secondary btn-small" onClick={resetEditForm}>Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{formatCurrency(selectedFee.amount || 0)}</td>
                              <td>{selectedFee.installments || 3}</td>
                              <td>{formatCurrency(Math.max((selectedFee.amount || 0) - (selectedFee.paidAmount || 0), 0))}</td>
                              <td>{formatCurrency(selectedFee.paidAmount || 0)}</td>
                              <td>{selectedFee.paymentMethod || '-'}</td>
                              {isAccountant && (
                                <>
                                  <td>
                                    <button className="btn btn-secondary btn-small" onClick={() => handleEditFee(selectedFee)}>
                                      Edit
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-danger btn-small"
                                      onClick={() => handleDeleteStudentFees(getStudentIdentifier(selectedStudentRecord))}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </>
                              )}
                            </>
                          )}
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="9">No fee details found for the selected student.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info" style={{ marginTop: '10px' }}>
                  Select a student to view and manage the fee details for that record.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
