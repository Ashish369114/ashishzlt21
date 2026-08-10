const { Employee, User, Class, School } = require('../models');

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: School, as: 'school' }
      ]
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: School, as: 'school' }
      ]
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const normalizeEmployeeType = (rawType) => {
  if (!rawType) return 'teaching';
  const str = String(rawType).trim();
  
  const validEnumValues = [
    'Pre-Primary', 'Junior School', 'High School', 'Non-Teaching Staff', 
    'teaching', 'non_teaching', 'staff', 'admin', 'support', 'maintenance'
  ];

  if (validEnumValues.includes(str)) return str;

  const lower = str.toLowerCase();
  if (lower.includes('junior')) return 'Junior School';
  if (lower.includes('pre')) return 'Pre-Primary';
  if (lower.includes('high')) return 'High School';
  if (lower.includes('non') || lower.includes('clerk') || lower.includes('admin') || lower.includes('librarian')) return 'Non-Teaching Staff';
  if (lower.includes('teach')) return 'teaching';
  if (lower.includes('staff')) return 'staff';
  if (lower.includes('support')) return 'support';
  if (lower.includes('maint')) return 'maintenance';
  
  return 'teaching';
};

const addEmployee = async (req, res) => {
  try {
    const typeVal = normalizeEmployeeType(req.body.employeeType);

    const employeeData = {
      ...req.body,
      employeeType: typeVal,
      employeeId: req.body.employeeId || `EMP-${Date.now()}`,
    };
    const newEmployee = await Employee.create(employeeData);
    
    const populatedEmployee = await Employee.findByPk(newEmployee.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: School, as: 'school' }
      ]
    });

    const io = req.app.locals.io;
    if (io) {
      const schoolId = populatedEmployee.schoolId;
      io.to(`school:${schoolId}`).emit('employee:added', populatedEmployee.toJSON());
      io.to(`role:super_admin`).emit('employee:added', populatedEmployee.toJSON());
      io.to(`role:principal`).emit('employee:added', populatedEmployee.toJSON());
      io.to(`role:admin`).emit('employee:added', populatedEmployee.toJSON());
    }

    res.status(201).json(populatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    Object.assign(employee, req.body);
    if (req.body.employeeType) {
      employee.employeeType = normalizeEmployeeType(req.body.employeeType);
    }
    await employee.save();
    
    const populatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: School, as: 'school' }
      ]
    });

    const io = req.app.locals.io;
    if (io) {
      const schoolId = populatedEmployee.schoolId;
      io.to(`school:${schoolId}`).emit('employee:updated', populatedEmployee.toJSON());
      io.to(`role:super_admin`).emit('employee:updated', populatedEmployee.toJSON());
      io.to(`role:principal`).emit('employee:updated', populatedEmployee.toJSON());
      io.to(`role:admin`).emit('employee:updated', populatedEmployee.toJSON());
    }

    res.json(populatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const schoolId = employee.schoolId;
    await employee.destroy();
    
    const io = req.app.locals.io;
    if (io) {
      io.to(`school:${schoolId}`).emit('employee:deleted', { id: employee.id, schoolId });
      io.to(`role:super_admin`).emit('employee:deleted', { id: employee.id, schoolId });
      io.to(`role:principal`).emit('employee:deleted', { id: employee.id, schoolId });
      io.to(`role:admin`).emit('employee:deleted', { id: employee.id, schoolId });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.findAll({ 
      where: {
        schoolId: req.params.schoolId,
        department: req.params.department 
      },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeesByType = async (req, res) => {
  try {
    const employees = await Employee.findAll({ 
      where: {
        schoolId: req.params.schoolId,
        employeeType: req.params.type 
      },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmployeeSalary = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    employee.salary = req.body;
    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getEmployeePayroll = async (req, res) => {
  try {
    const employees = await Employee.findAll({ 
      where: { schoolId: req.params.schoolId },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    const payroll = employees.map(emp => {
      const e = emp.toJSON();
      return {
        _id: e.id,
        id: e.id,
        employeeId: e.employeeId,
        name: e.user ? `${e.user.firstName} ${e.user.lastName}` : e.designation,
        baseSalary: e.salary?.baseSalary || 0,
        allowances: e.salary?.allowances || {},
        deductions: e.salary?.deductions || {},
        netSalary: (e.salary?.baseSalary || 0) + 
                   Object.values(e.salary?.allowances || {}).reduce((a, b) => a + Number(b), 0) -
                   Object.values(e.salary?.deductions || {}).reduce((a, b) => a + Number(b), 0),
      };
    });
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
