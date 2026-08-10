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

    const existingUser = await User.findOne({ where: { userId } });
    const existingStudent = await Student.findOne({ where: { rollNumber } });
    if (existingStudent) {
      return res.status(400).json({ message: `Roll number '${rollNumber}' is already assigned to another student.` });
    }

    let user = existingUser;
    if (existingUser) {
      if (existingUser.role !== 'student') {
        return res.status(400).json({ message: `Student user ID '${userId}' is already in use.` });
      }

      const existingStudentProfile = await Student.findOne({ where: { userId: existingUser.id } });
      if (existingStudentProfile) {
        return res.status(400).json({ message: `Student user ID '${userId}' is already in use.` });
      }

      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.dateOfBirth = dateOfBirth;
      existingUser.phone = phone;
      existingUser.gender = gender;
      if (password) {
        existingUser.password = password;
      }
      await existingUser.save();
    } else {
      user = await User.create({
        userId,
        password,
        role: 'student',
        firstName,
        lastName,
        dateOfBirth,
        phone,
        gender,
        email,
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
          password: parentPassword,
          role: 'parent',
          firstName: pFirstName,
          lastName: pLastName,
          email: parentEmail,
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
      admissionDate,
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: `Duplicate value error.` });
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
