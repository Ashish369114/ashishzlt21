const { Homework, Student, Class, Subject, Teacher, User } = require('../models');

const populateSubmissions = async (homeworks) => {
  const isArray = Array.isArray(homeworks);
  const hws = isArray ? homeworks : [homeworks];

  for (const hw of hws) {
    if (hw.submissions && Array.isArray(hw.submissions)) {
      for (const sub of hw.submissions) {
        if (sub.student) {
          sub.student = await Student.findOne({ 
            where: { userId: sub.student }, 
            include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] 
          }) || await Student.findByPk(sub.student, { include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] });
        }
        if (sub.verifiedBy) {
          sub.verifiedBy = await User.findByPk(sub.verifiedBy, { attributes: { exclude: ['password'] } }) || await User.findOne({ where: { userId: sub.verifiedBy }, attributes: { exclude: ['password'] } });
        }
      }
    }
  }

  return isArray ? hws : hws[0];
};

const getHomework = async (req, res) => {
  try {
    const homework = await Homework.findAll({
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(homework);
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    await populateSubmissions(homework);
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const homework = await Homework.findAll({ 
      where: { classId },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(homework);
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkBySubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const homework = await Homework.findAll({ 
      where: { subjectId },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(homework);
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkByStudent = async (req, res) => {
  try {
    const studentIdentifier = req.params.studentId;
    
    let student = null;
    const isNumeric = !isNaN(studentIdentifier);
    if (isNumeric) {
      student = await Student.findByPk(studentIdentifier);
    }
    
    if (!student) {
      const user = await User.findOne({ where: { userId: studentIdentifier } });
      if (user) {
        student = await Student.findOne({ where: { userId: user.id } });
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const homework = await Homework.findAll({ 
      where: { classId: student.classId },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(homework);
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sanitizeHomeworkBody = (body) => {
  const payload = { ...body };
  if (payload.class) {
    payload.classId = payload.class;
    delete payload.class;
  }
  if (payload.subject) {
    payload.subjectId = payload.subject;
    delete payload.subject;
  }
  if (payload.teacher) {
    payload.teacherId = payload.teacher;
    delete payload.teacher;
  }
  return payload;
};

const addHomework = async (req, res) => {
  try {
    const payload = sanitizeHomeworkBody(req.body);
    const homework = await Homework.create(payload);
    
    const populatedHomework = await Homework.findByPk(homework.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });

    res.status(201).json(populatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHomework = async (req, res) => {
  try {
    const payload = sanitizeHomeworkBody(req.body);
    const homework = await Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    
    Object.assign(homework, payload);
    await homework.save();

    const populatedHomework = await Homework.findByPk(homework.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(populatedHomework);
    res.json(populatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const submitHomework = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit homework.' });
    }

    const homework = await Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const { fileName, fileType, fileData, comments } = req.body;
    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({ message: 'File name, type, and data are required.' });
    }

    const studentId = String(req.user.userId);
    let submissions = [...(homework.submissions || [])];
    
    let existingSubmissionIndex = submissions.findIndex(
      (submission) => String(submission.student) === studentId
    );

    const submissionPayload = {
      id: `SUB-${Date.now()}`,
      student: studentId,
      fileName,
      fileType,
      fileData,
      comments: comments || '',
      status: 'Completed',
      submittedAt: new Date(),
    };

    if (existingSubmissionIndex !== -1) {
      const existing = submissions[existingSubmissionIndex];
      submissions[existingSubmissionIndex] = {
        ...existing,
        fileName,
        fileType,
        fileData,
        comments: comments || existing.comments,
        status: 'Completed',
        submittedAt: new Date(),
        teacherFeedback: existing.teacherFeedback || ''
      };
    } else {
      submissions.push(submissionPayload);
    }

    homework.submissions = submissions;
    await homework.save();

    const populatedHomework = await Homework.findByPk(homework.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(populatedHomework);
    res.json(populatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const reviewHomework = async (req, res) => {
  try {
    if (!['teacher', 'super_admin', 'principal'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only teachers and admins can review submissions.' });
    }

    const homework = await Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const { submissionId, status, teacherFeedback } = req.body;
    
    let submissions = [...(homework.submissions || [])];
    let submissionIndex = submissions.findIndex(s => String(s.id) === String(submissionId) || String(s._id) === String(submissionId));
    
    if (submissionIndex === -1) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    let submission = { ...submissions[submissionIndex] };

    if (status) {
      submission.status = status;
      if (status === 'Reviewed') {
        submission.verifiedBy = req.user.userId;
        submission.verifiedAt = new Date();
      }
    }
    if (teacherFeedback !== undefined) {
      submission.teacherFeedback = teacherFeedback;
    }

    submissions[submissionIndex] = submission;
    homework.submissions = submissions;
    await homework.save();

    const populatedHomework = await Homework.findByPk(homework.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
      ]
    });
    
    await populateSubmissions(populatedHomework);
    res.json(populatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findByPk(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    await homework.destroy();
    res.json({ message: 'Homework deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHomework,
  getHomeworkById,
  getHomeworkByClass,
  getHomeworkBySubject,
  getHomeworkByStudent,
  addHomework,
  updateHomework,
  submitHomework,
  reviewHomework,
  deleteHomework,
};
