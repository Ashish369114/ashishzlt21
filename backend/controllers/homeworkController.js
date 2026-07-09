const Homework = require('../models/Homework');
const Student = require('../models/Student');

const getHomework = async (req, res) => {
  try {
    const homework = await Homework.find()
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const homework = await Homework.find({ class: classId })
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkBySubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const homework = await Homework.find({ subject: subjectId })
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findOne({
      $or: [{ _id: studentId }, { userId: studentId }],
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const homework = await Homework.find({ class: student.class })
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addHomework = async (req, res) => {
  try {
    const homework = new Homework(req.body);
    await homework.save();
    await homework.populate('class subject teacher');
    res.status(201).json(homework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHomework = async (req, res) => {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');
    res.json(homework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const submitHomework = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit homework.' });
    }

    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const { fileName, fileType, fileData, comments } = req.body;
    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({ message: 'File name, type, and data are required.' });
    }

    const studentId = req.user.userId.toString();
    const existingSubmission = homework.submissions.find(
      (submission) => submission.student?.toString() === studentId
    );

    const submissionPayload = {
      student: studentId,
      fileName,
      fileType,
      fileData,
      comments: comments || '',
      status: 'Completed',
      submittedAt: new Date(),
    };

    if (existingSubmission) {
      existingSubmission.fileName = fileName;
      existingSubmission.fileType = fileType;
      existingSubmission.fileData = fileData;
      existingSubmission.comments = comments || existingSubmission.comments;
      existingSubmission.status = 'Completed';
      existingSubmission.submittedAt = new Date();
      existingSubmission.teacherFeedback = existingSubmission.teacherFeedback || '';
    } else {
      homework.submissions.push(submissionPayload);
    }

    await homework.save();

    const populatedHomework = await Homework.findById(homework._id)
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');

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

    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const { submissionId, status, teacherFeedback } = req.body;
    const submission = homework.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

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

    await homework.save();

    const populatedHomework = await Homework.findById(homework._id)
      .populate('class')
      .populate('subject')
      .populate('teacher')
      .populate('submissions.student')
      .populate('submissions.verifiedBy');

    res.json(populatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findByIdAndDelete(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
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
