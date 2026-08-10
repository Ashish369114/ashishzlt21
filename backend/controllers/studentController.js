const { User, Student, Class } = require('../models');

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

    // Sanitize optional fields to avoid empty string validation & unique constraint failures
    const cleanEmail = email && typeof email === 'string' && email.trim() !== '' ? email.trim() : null;
    const cleanParentEmail = parentEmail && typeof parentEmail === 'string' && parentEmail.trim() !== '' ? parentEmail.trim() : null;
    const cleanDob = dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.trim() !== '' ? dateOfBirth : null;
    const cleanAdmDate = admissionDate && typeof admissionDate === 'string' && admissionDate.trim() !== '' ? admissionDate : null;
    const cleanPassword = password && typeof password === 'string' && password.trim().length >= 6 ? password : 'Student@123';

    if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim() === '') {
      rollNumber = `${Date.now().toString().slice(-4)}`;
    }

    const existingStudent = await Student.findOne({ where: { rollNumber } });
    if (existingStudent) {
      rollNumber = `${rollNumber}_${Date.now().toString().slice(-3)}`;
    }

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      userId = `STD-${rollNumber}`;
    }

    let existingUser = await User.findOne({ where: { userId } });
    if (existingUser && existingUser.role !== 'student') {
      userId = `${userId}_${Date.now().toString().slice(-3)}`;
      existingUser = null;
    }

    let user = existingUser;
    if (existingUser) {
      const existingStudentProfile = await Student.findOne({ where: { userId: existingUser.id } });
      if (existingStudentProfile) {
        // If student profile already linked to this user ID, generate unique suffix
        userId = `${userId}_${Date.now().toString().slice(-3)}`;
        user = await User.create({
          userId,
          password: cleanPassword,
          role: 'student',
          firstName: firstName || 'New',
          lastName: lastName || 'Student',
          dateOfBirth: cleanDob,
          phone,
          gender: gender || 'Male',
          email: cleanEmail,
        });
      } else {
        existingUser.firstName = firstName || existingUser.firstName;
        existingUser.lastName = lastName || existingUser.lastName;
        existingUser.dateOfBirth = cleanDob || existingUser.dateOfBirth;
        existingUser.phone = phone || existingUser.phone;
        existingUser.gender = gender || existingUser.gender;
        if (cleanPassword) {
          existingUser.password = cleanPassword;
        }
        await existingUser.save();
      }
    } else {
      user = await User.create({
        userId,
        password: cleanPassword,
        role: 'student',
        firstName: firstName || 'New',
        lastName: lastName || 'Student',
        dateOfBirth: cleanDob,
        phone,
        gender: gender || 'Male',
        email: cleanEmail,
      });
    }

    let parentIdObj = null;

    if (!parentUserId && (parentFirstName || parentLastName || parentEmail || parentPhone || parentAddress || parentRelationship)) {
      parentUserId = `PAR-${rollNumber}`;
    }
    if (parentUserId && !parentPassword) {
      parentPassword = 'Parent@123';
    }

    if (parentUserId || parentPassword) {
      if (!parentUserId || !parentPassword) {
        return res.status(400).json({ message: 'Both Parent User ID and Parent Password are required when creating a parent account.' });
      }

      const existingParentUser = await User.findOne({ where: { userId: parentUserId } });
      if (existingParentUser) {
        if (existingParentUser.role !== 'parent') {
          return res.status(400).json({ message: `Specified parent user ID '${parentUserId}' is already in use.` });
        }
        if (parentFirstName) existingParentUser.firstName = parentFirstName;
        if (parentLastName) existingParentUser.lastName = parentLastName;
        if (parentEmail) existingParentUser.email = parentEmail;
        if (parentPhone) existingParentUser.phone = parentPhone;
        if (parentGender) existingParentUser.gender = parentGender;
        await existingParentUser.save();
        parentIdObj = existingParentUser.id;
      } else {
        const pFirstName = parentFirstName || 'Parent of';
        const pLastName = parentLastName || firstName || 'Student';

        const parentUser = await User.create({
          userId: parentUserId,
          password: cleanParentPassword,
          role: 'parent',
          firstName: pFirstName,
          lastName: pLastName,
          email: cleanParentEmail,
          phone: parentPhone,
          gender: parentGender,
        });
        parentIdObj = parentUser.id;
      }
    } else if (parentId) {
      parentIdObj = parentId;
    }

    let validClassId = parseInt(classId);
    if (isNaN(validClassId)) {
      let targetGrade = 1;
      let targetSection = 'A';
      if (typeof classId === 'string' && classId.includes('_')) {
        const parts = classId.split('_');
        if (parts.length >= 3) {
          targetGrade = parseInt(parts[1]) || 1;
          targetSection = parts[2].toUpperCase();
        }
      }
      let foundClass = await Class.findOne({ where: { grade: targetGrade, section: targetSection } });
      if (!foundClass) {
        foundClass = await Class.create({ grade: targetGrade, section: targetSection });
      }
      validClassId = foundClass.id;
    }

    const student = await Student.create({
      userId: user.id,
      rollNumber,
      classId: validClassId,
      parentId: parentIdObj,
      admissionDate: cleanAdmDate,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Add student error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: `Duplicate value error: ${error.errors?.[0]?.message || error.message}` });
    }
    res.status(400).json({ message: error.message });
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
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await student.destroy();
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
