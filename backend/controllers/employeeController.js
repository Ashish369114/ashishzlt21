const Employee = require('../models/Employee');

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId')
      .populate('school');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId')
      .populate('school');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEmployee = async (req, res) => {
  const employee = new Employee({
    ...req.body,
    employeeId: `EMP-${Date.now()}`,
  });
  try {
    const newEmployee = await employee.save();
    const populatedEmployee = await Employee.findById(newEmployee._id)
      .populate('userId')
      .populate('school');

    // Emit socket event to notify real-time updates
    const io = req.app.locals.io;
    if (io) {
      io.to(`school:${newEmployee.school}`).emit('employee:added', populatedEmployee.toObject());
      io.to(`role:super_admin`).emit('employee:added', populatedEmployee.toObject());
      io.to(`role:principal`).emit('employee:added', populatedEmployee.toObject());
      io.to(`role:admin`).emit('employee:added', populatedEmployee.toObject());
    }

    res.status(201).json(populatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    Object.assign(employee, req.body);
    const updatedEmployee = await employee.save();
    const populatedEmployee = await Employee.findById(updatedEmployee._id)
      .populate('userId')
      .populate('school');

    // Emit socket event to notify real-time updates
    const io = req.app.locals.io;
    if (io) {
      io.to(`school:${updatedEmployee.school}`).emit('employee:updated', populatedEmployee.toObject());
      io.to(`role:super_admin`).emit('employee:updated', populatedEmployee.toObject());
      io.to(`role:principal`).emit('employee:updated', populatedEmployee.toObject());
      io.to(`role:admin`).emit('employee:updated', populatedEmployee.toObject());
    }

    res.json(populatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Emit socket event to notify real-time updates
    const io = req.app.locals.io;
    if (io) {
      io.to(`school:${employee.school}`).emit('employee:deleted', { id: employee._id, schoolId: employee.school });
      io.to(`role:super_admin`).emit('employee:deleted', { id: employee._id, schoolId: employee.school });
      io.to(`role:principal`).emit('employee:deleted', { id: employee._id, schoolId: employee.school });
      io.to(`role:admin`).emit('employee:deleted', { id: employee._id, schoolId: employee.school });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.find({ 
      school: req.params.schoolId,
      department: req.params.department 
    }).populate('userId');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeesByType = async (req, res) => {
  try {
    const employees = await Employee.find({ 
      school: req.params.schoolId,
      employeeType: req.params.type 
    }).populate('userId');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmployeeSalary = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    employee.salary = req.body;
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getEmployeePayroll = async (req, res) => {
  try {
    const employees = await Employee.find({ school: req.params.schoolId }).populate('userId');
    const payroll = employees.map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      name: emp.userId ? `${emp.userId.firstName} ${emp.userId.lastName}` : emp.designation,
      baseSalary: emp.salary?.baseSalary || 0,
      allowances: emp.salary?.allowances || {},
      deductions: emp.salary?.deductions || {},
      netSalary: (emp.salary?.baseSalary || 0) + 
                 Object.values(emp.salary?.allowances || {}).reduce((a, b) => a + b, 0) -
                 Object.values(emp.salary?.deductions || {}).reduce((a, b) => a + b, 0),
    }));
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getEmployeesByType,
  updateEmployeeSalary,
  getEmployeePayroll,
};
