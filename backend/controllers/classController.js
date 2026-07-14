const Subject = require('../models/Subject');
const Class = require('../models/Class');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveClassTeacher = async (teacherInput) => {
  if (!teacherInput) {
    return { teacherUserId: null, teacherProfile: null };
  }

  let teacherProfile = await Teacher.findById(teacherInput);
  if (!teacherProfile) {
    teacherProfile = await Teacher.findOne({ userId: teacherInput });
  }

  return {
    teacherUserId: teacherProfile?.userId || teacherInput,
    teacherProfile,
  };
};

const syncTeacherClassAssignment = async (teacherProfile, classId, action = 'add') => {
  if (!teacherProfile?._id) {
    return;
  }

  const update = action === 'add'
    ? { $addToSet: { assignedClasses: classId } }
    : { $pull: { assignedClasses: classId } };

  await Teacher.findByIdAndUpdate(teacherProfile._id, update);
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher')
      .populate('students')
      .sort({ grade: 1, section: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('classTeacher')
      .populate('students');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const { grade, section, classTeacher, subject } = req.body;
    const normalizedGrade = Number(grade);
    const normalizedSection = String(section || '').trim().toUpperCase();

    if (!Number.isInteger(normalizedGrade) || normalizedGrade < 1 || normalizedGrade > 10) {
      return res.status(400).json({ message: 'Grade must be between 1 and 10' });
    }

    if (!['A', 'B', 'C'].includes(normalizedSection)) {
      return res.status(400).json({ message: 'Section must be A, B, or C' });
    }

    const normalizedSubject = String(subject || '').trim();
    const subjectValue = normalizedSubject || 'N/A';
    const existing = await Class.findOne({
      grade: normalizedGrade,
      section: { $regex: new RegExp(`^${normalizedSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      subject: { $regex: new RegExp(`^${subjectValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (existing) {
      return res.status(200).json({ message: 'Class already exists', class: existing });
    }

    const { teacherUserId, teacherProfile } = await resolveClassTeacher(classTeacher);

    const newClass = new Class({
      grade: normalizedGrade,
      section: normalizedSection,
      ...(teacherUserId ? { classTeacher: teacherUserId } : {}),
      subject: subjectValue,
    });
    await newClass.save();

    if (teacherProfile?._id) {
      await syncTeacherClassAssignment(teacherProfile, newClass._id, 'add');
    }

    res.status(201).json(newClass);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate class entry found. A class already exists for this grade, section, and subject combination.',
      });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const updates = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, 'classTeacher')) {
      const shouldClearTeacher = req.body.classTeacher === '' || req.body.classTeacher === null;
      const { teacherUserId, teacherProfile } = await resolveClassTeacher(shouldClearTeacher ? null : req.body.classTeacher);
      const previousTeacher = existingClass.classTeacher
        ? await Teacher.findOne({ userId: existingClass.classTeacher })
        : null;

      if (previousTeacher?._id && previousTeacher._id.toString() !== teacherProfile?._id?.toString()) {
        await syncTeacherClassAssignment(previousTeacher, existingClass._id, 'remove');
      }

      updates.classTeacher = teacherUserId;

      if (teacherProfile?._id && !shouldClearTeacher) {
        await syncTeacherClassAssignment(teacherProfile, existingClass._id, 'add');
      }
    }

    const classData = await Class.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('classTeacher')
      .populate('students');
    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const teacherProfile = classData.classTeacher
      ? await Teacher.findOne({ userId: classData.classTeacher })
      : null;

    await Class.findByIdAndDelete(req.params.id);

    if (teacherProfile?._id) {
      await syncTeacherClassAssignment(teacherProfile, classData._id, 'remove');
    }

    return res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const assignClassTeacher = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;
    const currentClass = await Class.findById(classId);
    if (!currentClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const previousTeacher = currentClass.classTeacher
      ? await Teacher.findOne({ userId: currentClass.classTeacher })
      : null;
    const { teacherUserId, teacherProfile } = await resolveClassTeacher(teacherId);

    const classData = await Class.findByIdAndUpdate(classId, { classTeacher: teacherUserId }, { new: true })
      .populate('classTeacher')
      .populate('students');

    if (previousTeacher?._id && previousTeacher._id.toString() !== teacherProfile?._id?.toString()) {
      await syncTeacherClassAssignment(previousTeacher, currentClass._id, 'remove');
    }

    if (teacherProfile?._id) {
      await syncTeacherClassAssignment(teacherProfile, currentClass._id, 'add');
    }

    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalClasses = await Class.countDocuments();

    const classes = await Class.find()
      .populate('classTeacher')
      .populate('students');

    const sectionSummary = classes
      .sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section))
      .map((cls) => ({
        grade: cls.grade,
        section: cls.section,
        teacher: cls.classTeacher ? `${cls.classTeacher.firstName || ''} ${cls.classTeacher.lastName || ''}`.trim() : 'Unassigned',
        studentCount: Array.isArray(cls.students) ? cls.students.length : 0,
        subject: cls.subject || 'N/A',
      }));

    const assignedTeachers = await Teacher.find()
      .populate('userId')
      .populate({
        path: 'assignedClasses',
        select: 'grade section',
      });

    const teacherSummary = assignedTeachers.map((teacher) => {
      const uniqueGrades = [...new Set((teacher.assignedClasses || []).map((cls) => cls.grade))].sort((a, b) => a - b);
      const uniqueSections = [...new Set((teacher.assignedClasses || []).map((cls) => cls.section))].sort();
      return {
        name: teacher.userId ? `${teacher.userId.firstName || ''} ${teacher.userId.lastName || ''}`.trim() : 'Unknown',
        grades: uniqueGrades,
        sections: uniqueSections,
        subjects: teacher.isAllSubjectTeacher
          ? 'All subjects'
          : (teacher.teachingSubjects?.length ? teacher.teachingSubjects.map((subject) => subject.name || subject).join(', ') : teacher.subject?.name || 'N/A'),
      };
    });

    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      sectionSummary,
      teacherSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignClassTeacher,
  getDashboardStats,
};
