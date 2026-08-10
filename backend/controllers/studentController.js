const { User, Student, Class, Attendance, Marks, Fee, Remark, ConcessionRequest } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: { exclude: ['password'] } }
      ]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: { exclude: ['password'] } }
      ]
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentByUserId = async (req, res) => {
  try {
    const userIdParam = req.params.userId;

    let user = await User.findOne({ where: { userId: userIdParam } });
    let student;
    if (user) {
      student = await Student.findOne({ 
        where: { userId: user.id },
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } },
          { model: Class, as: 'class' },
          { model: User, as: 'parent', attributes: { exclude: ['password'] } }
        ]
      });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addStudent = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      userId,
      password,
      rollNumber,
      classId,
      grade,
      section,
      parentId,
      parentUserId,
      parentPassword,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      parentGender,
      parentAddress,
      parentRelationship,
      dateOfBirth,
      phone,
      gender,
      email,
      admissionDate,
    } = req.body;

    const fn = (firstName && typeof firstName === 'string' && firstName.trim()) ? firstName.trim() : 'New';
    const ln = (lastName && typeof lastName === 'string' && lastName.trim()) ? lastName.trim() : 'Student';

    // Sanitize optional fields to avoid empty string validation & unique constraint failures
    const cleanEmail = email && typeof email === 'string' && email.trim() !== '' ? email.trim() : null;
    const cleanParentEmail = parentEmail && typeof parentEmail === 'string' && parentEmail.trim() !== '' ? parentEmail.trim() : null;
    const cleanDob = dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.trim() !== '' ? dateOfBirth : null;
    const cleanAdmDate = admissionDate && typeof admissionDate === 'string' && admissionDate.trim() !== '' ? admissionDate : null;
    const cleanPassword = password && typeof password === 'string' && password.trim().length >= 6 ? password.trim() : 'Student@123';
    const cleanParentPassword = parentPassword && typeof parentPassword === 'string' && parentPassword.trim().length >= 6 ? parentPassword.trim() : 'Parent@123';

    const validGenders = ['Male', 'Female', 'Other'];
    const cleanGender = validGenders.includes(gender) ? gender : 'Male';
    const cleanParentGender = validGenders.includes(parentGender) ? parentGender : 'Male';

    // 1. Resolve Class / Grade / Section
    let targetGrade = parseInt(grade);
    let targetSection = (section || 'A').toString().toUpperCase();

    if (isNaN(targetGrade) || targetGrade < 1 || targetGrade > 12) {
      if (typeof classId === 'string' && classId.includes('_')) {
        const parts = classId.split('_');
        for (let i = 0; i < parts.length; i++) {
          const num = parseInt(parts[i]);
          if (!isNaN(num)) targetGrade = num;
          else if (parts[i].length === 1 && /[a-zA-Z]/.test(parts[i])) targetSection = parts[i].toUpperCase();
        }
      } else if (classId === 'c1') {
        targetGrade = 9; targetSection = 'A';
      } else if (classId === 'c2') {
        targetGrade = 9; targetSection = 'B';
      } else {
        targetGrade = 9;
      }
    }

    let validClassId = parseInt(classId);
    let foundClass = null;
    if (!isNaN(validClassId)) {
      foundClass = await Class.findByPk(validClassId);
    }
    if (!foundClass) {
      foundClass = await Class.findOne({ where: { grade: targetGrade, section: targetSection } });
      if (!foundClass) {
        foundClass = await Class.create({ grade: targetGrade, section: targetSection });
      }
    }
    validClassId = foundClass.id;

    // 2. Auto-generate Roll Number if missing or occupied
    if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim() === '') {
      const existingInClass = await Student.findAll({ where: { classId: validClassId } });
      const nextNum = (existingInClass.length + 1);
      rollNumber = `${targetGrade * 100 + nextNum}`;
    }

    let existingStudent = await Student.findOne({ where: { rollNumber } });
    let rollCandidate = rollNumber;
    let rCounter = 1;
    while (existingStudent) {
      rollCandidate = `${rollNumber}_${rCounter++}`;
      existingStudent = await Student.findOne({ where: { rollNumber: rollCandidate } });
    }
    rollNumber = rollCandidate;

    // 3. Auto-generate User ID if missing or occupied
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      const numPart = rollNumber.replace(/\D/g, '').slice(-3) || Date.now().toString().slice(-3);
      userId = `STU${targetGrade}${targetSection}-${numPart}`;
    }

    let existingUser = await User.findOne({ where: { userId } });
    let uCandidate = userId;
    let uCounter = 1;
    while (existingUser) {
      uCandidate = `${userId}_${uCounter++}`;
      existingUser = await User.findOne({ where: { userId: uCandidate } });
    }
    userId = uCandidate;

    // 4. Create or reuse User account for student
    const user = await User.create({
      userId,
      password: cleanPassword,
      role: 'student',
      firstName: fn,
      lastName: ln,
      dateOfBirth: cleanDob,
      phone: phone || null,
      gender: cleanGender,
      email: cleanEmail,
    });

    // 5. Parent Account Auto-Creation or Link
    let parentIdObj = null;

    if (parentId) {
      const parsedParentId = parseInt(parentId);
      parentIdObj = isNaN(parsedParentId) ? null : parsedParentId;
    }

    if (!parentIdObj) {
      if (!parentUserId || typeof parentUserId !== 'string' || parentUserId.trim() === '') {
        parentUserId = `PAR-${rollNumber}`;
      }

      let existingParentUser = await User.findOne({ where: { userId: parentUserId } });
      if (existingParentUser) {
        if (existingParentUser.role === 'parent') {
          if (parentFirstName) existingParentUser.firstName = parentFirstName;
          if (parentLastName) existingParentUser.lastName = parentLastName;
          if (cleanParentEmail) existingParentUser.email = cleanParentEmail;
          if (parentPhone) existingParentUser.phone = parentPhone;
          existingParentUser.gender = cleanParentGender;
          await existingParentUser.save();
          parentIdObj = existingParentUser.id;
        }
      } else {
        const pFirstName = parentFirstName || 'Parent of';
        const pLastName = parentLastName || `${fn} ${ln}`;

        const parentUser = await User.create({
          userId: parentUserId,
          password: cleanParentPassword,
          role: 'parent',
          firstName: pFirstName,
          lastName: pLastName,
          email: cleanParentEmail,
          phone: parentPhone || phone || null,
          gender: cleanParentGender,
          address: parentAddress || null,
          relationship: parentRelationship || 'Parent'
        });
        parentIdObj = parentUser.id;
      }
    }

    // 6. Create Student Record
    const student = await Student.create({
      userId: user.id,
      rollNumber,
      classId: validClassId,
      parentId: parentIdObj,
      admissionDate: cleanAdmDate || new Date().toISOString().slice(0, 10),
    });

    const populatedStudent = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: { exclude: ['password'] } }
      ]
    });

    res.status(201).json(populatedStudent || student);
  } catch (error) {
    console.error('Add student error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: `Duplicate value error: ${error.errors?.[0]?.message || error.message}` });
    }
    res.status(400).json({ message: error.message || 'Failed to create student' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const {
      classId,
      parentId,
      parentUserId,
      parentPassword,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      parentGender,
      parentAddress,
      parentRelationship,
      firstName,
      lastName,
      password,
      phone,
      gender,
      dateOfBirth,
      email,
    } = req.body;

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (classId !== undefined) {
      student.classId = classId;
    }

    let parentIdObj = student.parentId;

    if (Object.prototype.hasOwnProperty.call(req.body, 'parentId')) {
      if (!parentId) {
        parentIdObj = null;
      } else {
        parentIdObj = parentId;
      }
    }

    if (parentUserId) {
      const existingParentUser = await User.findOne({ where: { userId: parentUserId } });
      if (existingParentUser && existingParentUser.role !== 'parent') {
        return res.status(400).json({ message: `Parent User ID '${parentUserId}' is already in use by another role.` });
      }

      if (existingParentUser) {
        if (parentFirstName !== undefined) existingParentUser.firstName = parentFirstName;
        if (parentLastName !== undefined) existingParentUser.lastName = parentLastName;
        if (parentEmail !== undefined) existingParentUser.email = parentEmail;
        if (parentPhone !== undefined) existingParentUser.phone = parentPhone;
        if (parentGender !== undefined) existingParentUser.gender = parentGender;
        if (parentPassword) existingParentUser.password = parentPassword;
        await existingParentUser.save();
        parentIdObj = existingParentUser.id;
      } else {
        if (!parentFirstName || !parentLastName) {
          return res.status(400).json({ message: 'Parent first name and last name are required when creating a new parent account.' });
        }

        const newParent = await User.create({
          userId: parentUserId,
          password: parentPassword || 'Parent@123',
          role: 'parent',
          firstName: parentFirstName,
          lastName: parentLastName,
          email: parentEmail,
          phone: parentPhone,
          gender: parentGender,
        });
        parentIdObj = newParent.id;
      }
    }

    student.parentId = parentIdObj;
    await student.save();

    const user = await User.findByPk(student.userId);
    if (user) {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (gender !== undefined) user.gender = gender;
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (password) user.password = password;
      await user.save();
    }

    const updatedStudent = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: { exclude: ['password'] } }
      ]
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const studentIdParam = req.params.id;
    let student = await Student.findByPk(studentIdParam, { transaction: t });
    if (!student && !isNaN(parseInt(studentIdParam))) {
      student = await Student.findByPk(parseInt(studentIdParam), { transaction: t });
    }
    if (!student) {
      student = await Student.findOne({ where: { userId: studentIdParam }, transaction: t });
    }
    if (!student) {
      const user = await User.findOne({ where: { userId: studentIdParam }, transaction: t });
      if (user) {
        student = await Student.findOne({ where: { userId: user.id }, transaction: t });
      }
    }

    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    const sId = student.id;
    const uId = student.userId;

    const studentIdentifiers = Array.from(new Set([
      sId,
      !isNaN(parseInt(sId)) ? parseInt(sId) : null,
      String(sId),
      uId,
      uId && !isNaN(parseInt(uId)) ? parseInt(uId) : null,
      uId ? String(uId) : null
    ].filter(v => v !== null && v !== undefined && !Number.isNaN(v))));

    // Delete child records first within transaction to satisfy foreign key constraints
    await ConcessionRequest.destroy({ where: { studentId: { [Op.in]: studentIdentifiers } }, transaction: t });
    await Attendance.destroy({ where: { studentId: { [Op.in]: studentIdentifiers } }, transaction: t });
    await Marks.destroy({ where: { studentId: { [Op.in]: studentIdentifiers } }, transaction: t });
    await Fee.destroy({ where: { studentId: { [Op.in]: studentIdentifiers } }, transaction: t });
    await Remark.destroy({ where: { studentId: { [Op.in]: studentIdentifiers } }, transaction: t });

    // Destroy student record
    await student.destroy({ transaction: t });

    // Destroy associated user record if present
    if (uId) {
      await User.destroy({ where: { id: uId }, transaction: t });
    }

    await t.commit();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error in deleteStudent:', error);
    res.status(500).json({ message: error.message || 'Failed to delete student' });
  }
};

const getStudentByParent = async (req, res) => {
  try {
    const parentIdentifier = req.user.userId;
    let parentObjectId = parentIdentifier;
    let students = [];

    students = await Student.findAll({ 
      where: { parentId: parentObjectId },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: { exclude: ['password'] } }
      ]
    });

    if (!students.length) {
      const parentUser = await User.findOne({ where: { userId: parentIdentifier } });
      if (parentUser) {
        parentObjectId = parentUser.id;
        students = await Student.findAll({ 
          where: { parentId: parentObjectId },
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Class, as: 'class' },
            { model: User, as: 'parent', attributes: { exclude: ['password'] } }
          ]
        });
      }
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const students = await Student.findAll({ 
      where: { classId },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: { exclude: ['password'] } }
      ]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  getStudentByUserId,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentByParent,
  getStudentsByClass,
};
