const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');

const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId')
      .populate('class')
      .populate('parentId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId')
      .populate('class')
      .populate('parentId');
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

    let student = await Student.findOne({ userId: userIdParam })
      .populate('userId')
      .populate('class')
      .populate('parentId');

    if (!student) {
      const user = await User.findOne({ userId: userIdParam });
      if (user) {
        student = await Student.findOne({ userId: user._id })
          .populate('userId')
          .populate('class')
          .populate('parentId');
      }
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

    const existingUser = await User.findOne({ userId });
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: `Roll number '${rollNumber}' is already assigned to another student.` });
    }

    let user = existingUser;
    if (existingUser) {
      if (existingUser.role !== 'student') {
        return res.status(400).json({ message: `Student user ID '${userId}' is already in use.` });
      }

      const existingStudentProfile = await Student.findOne({ userId: existingUser._id });
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
      user = new User({
        userId,
        password,
        role: 'student',
        firstName,
        lastName,
        dateOfBirth,
        phone,
        gender,
      });

      await user.save();
    }

    let parent = undefined;

    // Automatically generate a parent login when parent details are provided.
    if (!parentUserId && (parentFirstName || parentLastName || parentEmail || parentPhone || parentAddress || parentRelationship)) {
      parentUserId = `PAR-${rollNumber}`;
    }
    if (parentUserId && !parentPassword) {
      parentPassword = 'Parent@123';
    }

    // Prefer an existing or newly created parent user, or accept a parent ObjectId.
    if (parentUserId || parentPassword) {
      if (!parentUserId || !parentPassword) {
        return res.status(400).json({ message: 'Both Parent User ID and Parent Password are required when creating a parent account.' });
      }

      const existingParentUser = await User.findOne({ userId: parentUserId });
      if (existingParentUser) {
        if (existingParentUser.role !== 'parent') {
          return res.status(400).json({ message: `Specified parent user ID '${parentUserId}' is already in use.` });
        }
        if (parentFirstName) existingParentUser.firstName = parentFirstName;
        if (parentLastName) existingParentUser.lastName = parentLastName;
        if (parentEmail) existingParentUser.email = parentEmail;
        if (parentPhone) existingParentUser.phone = parentPhone;
        if (parentGender) existingParentUser.gender = parentGender;
        if (parentAddress) existingParentUser.address = parentAddress;
        if (parentRelationship) existingParentUser.relationship = parentRelationship;
        await existingParentUser.save();
        parent = existingParentUser._id;
      } else {
        if (!parentFirstName || !parentLastName) {
          return res.status(400).json({ message: 'Parent first name and last name are required when creating a new parent account.' });
        }

        const parentUser = new User({
          userId: parentUserId,
          password: parentPassword,
          role: 'parent',
          firstName: parentFirstName,
          lastName: parentLastName,
          email: parentEmail,
          phone: parentPhone,
          gender: parentGender,
          address: parentAddress,
          relationship: parentRelationship,
        });
        await parentUser.save();
        parent = parentUser._id;
      }
    } else if (parentId && typeof parentId === 'string' && parentId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'Invalid parentId provided' });
      }
      parent = parentId;
    }

    // Create student
    const student = new Student({
      userId: user._id,
      rollNumber,
      class: classId,
      parentId: parent,
      admissionDate,
    });

    await student.save();

    // Add student to class
    await Class.findByIdAndUpdate(classId, {
      $push: { students: user._id },
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateFields = Object.keys(error.keyPattern || {}).join(', ');
      return res.status(400).json({ message: `Duplicate value for field(s): ${duplicateFields}.` });
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

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (classId !== undefined) {
      student.class = classId;
    }

    let parentObjectId = student.parentId;

    if (Object.prototype.hasOwnProperty.call(req.body, 'parentId')) {
      if (!parentId || (typeof parentId === 'string' && parentId.trim() === '')) {
        parentObjectId = undefined;
      } else if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'Invalid parentId provided' });
      } else {
        parentObjectId = parentId;
      }
    }

    if (parentUserId) {
      const existingParentUser = await User.findOne({ userId: parentUserId });
      if (existingParentUser && existingParentUser.role !== 'parent') {
        return res.status(400).json({ message: `Parent User ID '${parentUserId}' is already in use by another role.` });
      }

      if (existingParentUser) {
        if (parentFirstName !== undefined) existingParentUser.firstName = parentFirstName;
        if (parentLastName !== undefined) existingParentUser.lastName = parentLastName;
        if (parentEmail !== undefined) existingParentUser.email = parentEmail;
        if (parentPhone !== undefined) existingParentUser.phone = parentPhone;
        if (parentGender !== undefined) existingParentUser.gender = parentGender;
        if (parentAddress !== undefined) existingParentUser.address = parentAddress;
        if (parentRelationship !== undefined) existingParentUser.relationship = parentRelationship;
        if (parentPassword) existingParentUser.password = parentPassword;
        await existingParentUser.save();
        parentObjectId = existingParentUser._id;
      } else {
        if (!parentFirstName || !parentLastName) {
          return res.status(400).json({ message: 'Parent first name and last name are required when creating a new parent account.' });
        }

        const newParent = new User({
          userId: parentUserId,
          password: parentPassword || 'Parent@123',
          role: 'parent',
          firstName: parentFirstName,
          lastName: parentLastName,
          email: parentEmail,
          phone: parentPhone,
          gender: parentGender,
          address: parentAddress,
          relationship: parentRelationship,
        });
        await newParent.save();
        parentObjectId = newParent._id;
      }
    }

    student.parentId = parentObjectId;
    await student.save();

    const user = await User.findById(student.userId);
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

    const updatedStudent = await Student.findById(req.params.id)
      .populate('userId')
      .populate('class')
      .populate('parentId');

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentByParent = async (req, res) => {
  try {
    const parentUserId = req.user.userId;
    const students = await Student.find({ parentId: parentUserId })
      .populate('userId')
      .populate('class')
      .populate('parentId');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const students = await Student.find({ class: classId })
      .populate('userId')
      .populate('class')
      .populate('parentId');
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
