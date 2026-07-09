const test = require('node:test');
const assert = require('assert');
const marksController = require('../controllers/marksController');
const Marks = require('../models/Marks');

const payload = {
  student: '   ',
  teacher: '  ',
  subject: 'subject-123',
  class: '',
  marks: '88',
  examType: 'Final',
};

test('sanitize blank objectId values from marks payload', () => {
  const sanitized = marksController.sanitizeMarksPayload(payload);

  assert.strictEqual(sanitized.student, undefined, 'Blank student values should be removed');
  assert.strictEqual(sanitized.teacher, undefined, 'Blank teacher values should be removed');
  assert.strictEqual(sanitized.class, undefined, 'Blank class values should be removed');
  assert.strictEqual(sanitized.subject, 'subject-123', 'Valid subject values should be preserved');
  assert.strictEqual(sanitized.marks, '88', 'Other fields should remain intact');
});

test('addMarks returns 400 when required fields are missing after sanitization', async () => {
  const originalSave = Marks.prototype.save;
  const originalPopulate = Marks.prototype.populate;

  Marks.prototype.save = async function () {
    return this;
  };
  Marks.prototype.populate = async function () {
    return this;
  };

  try {
    const req = { body: payload };
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await marksController.addMarks(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Missing required fields: student, teacher, class');
  } finally {
    Marks.prototype.save = originalSave;
    Marks.prototype.populate = originalPopulate;
  }
});
