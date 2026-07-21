const { Op } = require('sequelize');
const { User, Teacher, Subject, Class } = require('../models');

const generateTeacherUserId = async () => {
  const latestTeacher = await User.findOne({
    where: {
      role: 'teacher',
      userId: {
        [Op.like]: 'TEACHER___'
      }
    },
    order: [['userId', 'DESC']],
  });

  let nextNumber = 1;
  if (latestTeacher) {
    const match = latestTeacher.userId.match(/^TEACHER(\d{3})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  let generatedId = `TEACHER${String(nextNumber).padStart(3, '0')}`;
  while (await User.findOne({ where: { userId: generatedId } })) {
    nextNumber += 1;
    generatedId = `TEACHER${String(nextNumber).padStart(3, '0')}`;
  }

  return generatedId;
};

const normalizeTeacherEmail = (email) => {
  if (typeof email !== 'string') {
    return undefined;
  }

  const trimmedEmail = email.trim().toLowerCase();
  return trimmedEmail || undefined;
};

const resolveTeacherEmail = async (email, firstName, lastName, fallbackUserId) => {
  const normalizedEmail = normalizeTeacherEmail(email);
  if (normalizedEmail) {
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (!existingUser) {
      return normalizedEmail;
    }
  }

  const baseName = `${(firstName || 'teacher').toLowerCase().replace(/[^a-z0-9]+/g, '')}.${(lastName || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
  const suffix = Math.random().toString(36).slice(2, 7);
  const generatedEmail = `${baseName}${fallbackUserId ? '.' + fallbackUserId : ''}${suffix}@school.com`;
  const existingUser = await User.findOne({ where: { email: generatedEmail } });
  if (!existingUser) {
    return generatedEmail;
  }

  return `${baseName}${suffix}${Math.random().toString(36).slice(2, 7)}@school.com`;
};

const resolveTeacherSubject = async (subjectParam) => {
  if (subjectParam) {
    return subjectParam;
  }

  const fallbackSubject = await Subject.findOne();
  if (!fallbackSubject) {
    throw new Error('No subject available for teacher assignment');
  }

  return fallbackSubject.id;
};

const populateTeacherArrays = async (teachers) => {
  const isArray = Array.isArray(teachers);
  const teacherList = isArray ? teachers : [teachers];

  for (const t of teacherList) {
    if (t.teachingSubjects && t.teachingSubjects.length > 0) {
      t.dataValues.teachingSubjectsList = await Subject.findAll({ where: { id: t.teachingSubjects } });
    } else {
      t.dataValues.teachingSubjectsList = [];
    }

    if (t.assignedClasses && t.assignedClasses.length > 0) {
      t.dataValues.assignedClassesList = await Class.findAll({ where: { id: t.assignedClasses } });
    } else {
      t.dataValues.assignedClassesList = [];
    }
    
    // Fallback for frontend that expects 'teachingSubjects' to be populated arrays,
    // though this mutates the original Sequelize array value in dataValues.
    t.dataValues.teachingSubjects = t.dataValues.teachingSubjectsList;
    t.dataValues.assignedClasses = t.dataValues.assignedClassesList;
  }

  return isArray ? teacherList : teacherList[0];
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Subject, as: 'subject' }
      ]
    });
    
    await populateTeacherArrays(teachers);

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Subject, as: 'subject' }
      ]
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    await populateTeacherArrays(teacher);

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherByUserId = async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    let teacher;

    const isNumeric = !isNaN(userIdParam);

    if (isNumeric) {
      teacher = await Teacher.findOne({ 
        where: { userId: userIdParam },
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } },
          { model: Subject, as: 'subject' }
        ]
      });
    }

    if (!teacher) {
      const user = await User.findOne({ where: { userId: userIdParam } });
      if (user) {
        teacher = await Teacher.findOne({ 
          where: { userId: user.id },
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Subject, as: 'subject' }
          ]
        });
      }
    }

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found for this user' });
    }
    
    await populateTeacherArrays(teacher);

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTeacher = async (req, res) => {
  try {
    const { firstName, lastName, userId, password, subject, assignedClasses, qualifications, experience, joinDate, phone, gender, email, isAllSubjectTeacher, teachingSubjects, salary, designation, bio, status } = req.body;

    let finalUserId = userId?.trim();
    if (finalUserId) {
      const duplicateUser = await User.findOne({ where: { userId: finalUserId } });
      if (duplicateUser) {
        finalUserId = await generateTeacherUserId();
      }
    } else {
      finalUserId = await generateTeacherUserId();
    }

    const normalizedEmail = await resolveTeacherEmail(email, firstName, lastName, finalUserId);
    const resolvedSubject = await resolveTeacherSubject(subject);
    const safePassword = password || 'Teacher@123';

    const user = await User.create({
      userId: finalUserId,
      password: safePassword,
      role: 'teacher',
      firstName,
      lastName,
      phone,
      gender,
      email: normalizedEmail,
    });

    const teacher = await Teacher.create({
      userId: user.id,
      subjectId: resolvedSubject,
      teachingSubjects: Array.isArray(teachingSubjects) && teachingSubjects.length
        ? teachingSubjects
        : (Boolean(isAllSubjectTeacher) ? [] : [resolvedSubject]),
      isAllSubjectTeacher: Boolean(isAllSubjectTeacher),
      assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
      qualifications,
      experience,
      joinDate,
      salary,
      designation,
      bio,
      status,
    });

    res.status(201).json(teacher);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const duplicateKey = Object.keys(error.fields || {})[0];
      const message = duplicateKey === 'userId'
        ? 'User ID already exists'
        : duplicateKey === 'email'
        ? 'Email already exists'
        : 'Duplicate field value detected';
      return res.status(400).json({ message });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { firstName, lastName, password, email, phone, gender, subject, qualifications, experience, joinDate, assignedClasses, isAllSubjectTeacher, teachingSubjects, salary, designation, bio, status } = req.body;

    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (subject !== undefined) teacher.subjectId = subject;
    if (teachingSubjects !== undefined) teacher.teachingSubjects = teachingSubjects;
    if (isAllSubjectTeacher !== undefined) teacher.isAllSubjectTeacher = Boolean(isAllSubjectTeacher);
    if (qualifications !== undefined) teacher.qualifications = qualifications;
    if (experience !== undefined) teacher.experience = experience;
    if (joinDate !== undefined) teacher.joinDate = joinDate;
    if (assignedClasses !== undefined) teacher.assignedClasses = assignedClasses;
    if (salary !== undefined) teacher.salary = salary;
    if (designation !== undefined) teacher.designation = designation;
    if (bio !== undefined) teacher.bio = bio;
    if (status !== undefined) teacher.status = status;

    await teacher.save();

    const user = await User.findByPk(teacher.userId);
    if (user) {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (gender !== undefined) user.gender = gender;
      if (password) user.password = password;
      await user.save();
    }

    const updatedTeacher = await Teacher.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Subject, as: 'subject' }
      ]
    });
    
    await populateTeacherArrays(updatedTeacher);

    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    await teacher.destroy();
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignClassToTeacher = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const assigned = teacher.assignedClasses || [];
    if (!assigned.includes(classId)) {
      teacher.assignedClasses = [...assigned, classId];
      await teacher.save();
    }

    const updatedTeacher = await Teacher.findByPk(teacherId, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Subject, as: 'subject' }
      ]
    });
    
    await populateTeacherArrays(updatedTeacher);
    
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  getTeacherByUserId,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  assignClassToTeacher,
};
