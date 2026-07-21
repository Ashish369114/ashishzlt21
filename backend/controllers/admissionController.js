const { Op } = require('sequelize');
const { Admission, User, Student, School, Class } = require('../models');

const generateStudentUserId = async () => {
  const latestStudent = await User.findOne({
    where: {
      role: 'student',
      userId: {
        [Op.like]: 'STUDENT___'
      }
    },
    order: [['userId', 'DESC']],
  });

  let nextNumber = 1;
  if (latestStudent) {
    const match = latestStudent.userId.match(/^STUDENT(\d{3})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  let generatedId = `STUDENT${String(nextNumber).padStart(3, '0')}`;
  while (await User.findOne({ where: { userId: generatedId } })) {
    nextNumber += 1;
    generatedId = `STUDENT${String(nextNumber).padStart(3, '0')}`;
  }

  return generatedId;
};

const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.findAll({
      include: [
        { model: School, as: 'school' },
        { model: Class, as: 'appliedForClass' },
        { model: User, as: 'approvedBy', attributes: { exclude: ['password'] } }
      ]
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id, {
      include: [
        { model: School, as: 'school' },
        { model: Class, as: 'appliedForClass' },
        { model: User, as: 'approvedBy', attributes: { exclude: ['password'] } }
      ]
    });
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyForAdmission = async (req, res) => {
  try {
    const admissionData = {
      ...req.body,
      schoolId: req.body.school || req.user?.school,
      appliedForClassId: req.body.appliedForClass,
      admissionNumber: `ADM-${Date.now()}`,
      status: 'approved',
      approvalDate: new Date(),
      approvedById: req.user?.id,
    };

    const newAdmission = await Admission.create(admissionData);

    const studentUserId = await generateStudentUserId();
    const user = await User.create({
      userId: studentUserId,
      email: newAdmission.parentEmail,
      password: 'defaultPassword123',
      firstName: newAdmission.firstName,
      lastName: newAdmission.lastName,
      role: 'student',
      schoolId: newAdmission.schoolId,
      phone: newAdmission.phone,
    });

    const student = await Student.create({
      userId: user.id,
      rollNumber: `ROLL-${Date.now()}`,
      classId: newAdmission.appliedForClassId,
      parentId: null,
      admissionDate: new Date(),
      bloodGroup: newAdmission.bloodGroup,
      emergencyContact: newAdmission.parentPhone,
    });

    res.status(201).json(newAdmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    
    // Convert school and appliedForClass to their Id counterparts if present
    const updates = { ...req.body };
    if (updates.school) updates.schoolId = updates.school;
    if (updates.appliedForClass) updates.appliedForClassId = updates.appliedForClass;
    
    Object.assign(admission, updates);
    await admission.save();
    res.json(admission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const approveAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    if (admission.status === 'completed') {
      return res.status(400).json({ message: 'Admission already completed' });
    }

    admission.status = 'approved';
    admission.approvalDate = new Date();
    admission.approvedById = req.user.id;

    await admission.save();

    const studentUserId = await generateStudentUserId();
    const user = await User.create({
      userId: studentUserId,
      email: admission.parentEmail,
      password: 'defaultPassword123',
      firstName: admission.firstName,
      lastName: admission.lastName,
      role: 'student',
      schoolId: admission.schoolId,
      phone: admission.phone,
    });

    const student = await Student.create({
      userId: user.id,
      rollNumber: `ROLL-${Date.now()}`,
      classId: admission.appliedForClassId,
      parentId: null,
      admissionDate: new Date(),
      bloodGroup: admission.bloodGroup,
      emergencyContact: admission.parentPhone,
    });

    res.json({ 
      message: 'Admission approved successfully',
      admission,
      userId: user.id,
      studentId: student.id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const rejectAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    admission.status = 'rejected';
    admission.approvedById = req.user.id;
    admission.notes = req.body.rejectionReason || '';

    await admission.save();
    res.json({ message: 'Admission rejected successfully', admission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAdmissionsBySchool = async (req, res) => {
  try {
    const admissions = await Admission.findAll({ 
      where: { schoolId: req.params.schoolId },
      include: [
        { model: Class, as: 'appliedForClass' }
      ]
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmissionsByStatus = async (req, res) => {
  try {
    const admissions = await Admission.findAll({ 
      where: {
        schoolId: req.params.schoolId,
        status: req.params.status 
      }
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdmissions,
  getAdmissionById,
  applyForAdmission,
  updateAdmission,
  approveAdmission,
  rejectAdmission,
  getAdmissionsBySchool,
  getAdmissionsByStatus,
};
