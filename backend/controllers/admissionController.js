const Admission = require('../models/Admission');
const User = require('../models/User');
const Student = require('../models/Student');

const generateStudentUserId = async () => {
  const latestStudent = await User.find({
    role: 'student',
    userId: /^STUDENT\d{3}$/,
  })
    .sort({ userId: -1 })
    .limit(1)
    .lean();

  let nextNumber = 1;
  if (latestStudent.length) {
    const match = latestStudent[0].userId.match(/^STUDENT(\d{3})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  let generatedId = `STUDENT${String(nextNumber).padStart(3, '0')}`;
  while (await User.findOne({ userId: generatedId })) {
    nextNumber += 1;
    generatedId = `STUDENT${String(nextNumber).padStart(3, '0')}`;
  }

  return generatedId;
};

const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('school')
      .populate('appliedForClass')
      .populate('approvedBy');
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('school')
      .populate('appliedForClass')
      .populate('approvedBy');
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
    const admission = new Admission({
      ...req.body,
      admissionNumber: `ADM-${Date.now()}`,
      status: 'approved',
      approvalDate: new Date(),
      approvedBy: req.user?.id,
      school: req.body.school || req.user?.school,
    });

    const newAdmission = await admission.save();

    // Create user account for approved student
    const studentUserId = await generateStudentUserId();
    const user = new User({
      userId: studentUserId,
      email: admission.parentEmail,
      password: 'defaultPassword123', // Should be generated securely
      firstName: admission.firstName,
      lastName: admission.lastName,
      role: 'student',
      school: admission.school,
      phone: admission.phone,
    });

    await user.save();

    // Create student record
    const student = new Student({
      userId: user._id,
      rollNumber: `ROLL-${Date.now()}`,
      class: admission.appliedForClass,
      parentId: null,
      admissionDate: new Date(),
      bloodGroup: admission.bloodGroup,
      emergencyContact: admission.parentPhone,
    });

    await student.save();

    res.status(201).json(newAdmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    Object.assign(admission, req.body);
    const updatedAdmission = await admission.save();
    res.json(updatedAdmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const approveAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    if (admission.status === 'completed') {
      return res.status(400).json({ message: 'Admission already completed' });
    }

    admission.status = 'approved';
    admission.approvalDate = new Date();
    admission.approvedBy = req.user.id;

    await admission.save();

    // Create user account for approved student
    const studentUserId = await generateStudentUserId();
    const user = new User({
      userId: studentUserId,
      email: admission.parentEmail,
      password: 'defaultPassword123', // Should be generated securely
      firstName: admission.firstName,
      lastName: admission.lastName,
      role: 'student',
      school: admission.school,
      phone: admission.phone,
    });

    await user.save();

    // Create student record
    const student = new Student({
      userId: user._id,
      rollNumber: `ROLL-${Date.now()}`,
      class: admission.appliedForClass,
      parentId: null,
      admissionDate: new Date(),
      bloodGroup: admission.bloodGroup,
      emergencyContact: admission.parentPhone,
    });

    await student.save();

    res.json({ 
      message: 'Admission approved successfully',
      admission,
      userId: user._id,
      studentId: student._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const rejectAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    admission.status = 'rejected';
    admission.approvedBy = req.user.id;
    admission.notes = req.body.rejectionReason || '';

    await admission.save();
    res.json({ message: 'Admission rejected successfully', admission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAdmissionsBySchool = async (req, res) => {
  try {
    const admissions = await Admission.find({ school: req.params.schoolId })
      .populate('appliedForClass');
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmissionsByStatus = async (req, res) => {
  try {
    const admissions = await Admission.find({ 
      school: req.params.schoolId,
      status: req.params.status 
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
