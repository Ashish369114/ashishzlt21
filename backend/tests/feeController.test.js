const test = require('node:test');
const assert = require('assert');
const mongoose = require('mongoose');
const feeController = require('../controllers/feeController');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const User = require('../models/User');

test('updateFee recalculates payment status when amount is changed', async () => {
  const savedFee = {
    _id: 'fee-1',
    student: 'student-1',
    amount: 5000,
    paidAmount: 4000,
    isPaid: false,
    description: 'Old description',
    dueDate: new Date('2025-01-15'),
    installments: 3,
    remarks: 'Old remark',
    async save() {
      this.saved = true;
      return this;
    },
    async populate() {
      return this;
    },
  };

  const originalFindById = Fee.findById;
  const originalFindByIdAndUpdate = Fee.findByIdAndUpdate;

  try {
    Fee.findById = async () => savedFee;
    Fee.findByIdAndUpdate = async () => {
      throw new Error('findByIdAndUpdate should not be used for fee updates');
    };

    const req = {
      params: { id: 'fee-1' },
      body: { amount: 3000, description: 'Updated description' },
    };

    const res = {
      body: null,
      statusCode: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await feeController.updateFee(req, res);

    assert.strictEqual(savedFee.amount, 3000);
    assert.strictEqual(savedFee.description, 'Updated description');
    assert.strictEqual(savedFee.isPaid, true);
    assert.strictEqual(res.statusCode, null);
    assert.strictEqual(res.body.amount, 3000);
  } finally {
    Fee.findById = originalFindById;
    Fee.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test('updateFee persists the edited fee values for a specific student', async () => {
  const savedFee = {
    _id: 'fee-2',
    student: 'student-2',
    amount: 4000,
    paidAmount: 1000,
    isPaid: false,
    description: 'Annual Tuition Fees',
    dueDate: new Date('2025-01-15'),
    installments: 3,
    paymentMethod: 'Cash',
    async save() {
      this.saved = true;
      return this;
    },
    async populate() {
      return this;
    },
  };

  const originalFindById = Fee.findById;

  try {
    Fee.findById = async () => savedFee;

    const req = {
      params: { id: 'fee-2' },
      body: { amount: 5000, installments: 4, paidAmount: 3000, paymentMethod: 'UPI' },
    };

    const res = {
      body: null,
      statusCode: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await feeController.updateFee(req, res);

    assert.strictEqual(savedFee.amount, 5000);
    assert.strictEqual(savedFee.installments, 4);
    assert.strictEqual(savedFee.paidAmount, 3000);
    assert.strictEqual(savedFee.paymentMethod, 'UPI');
    assert.strictEqual(savedFee.isPaid, false);
    assert.strictEqual(res.body.paymentMethod, 'UPI');
  } finally {
    Fee.findById = originalFindById;
  }
});

test('deleteFeesByStudent removes every fee record for a student', async () => {
  const deletedQueries = [];
  const originalDeleteMany = Fee.deleteMany;

  try {
    Fee.deleteMany = async (query) => {
      deletedQueries.push(query);
      return { deletedCount: 2 };
    };

    const req = {
      params: { studentId: 'student-1' },
    };

    const res = {
      body: null,
      statusCode: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await feeController.deleteFeesByStudent(req, res);

    assert.deepStrictEqual(deletedQueries[0], { student: 'student-1' });
    assert.strictEqual(res.statusCode, null);
    assert.deepStrictEqual(res.body, { message: 'Fees deleted', deletedCount: 2 });
  } finally {
    Fee.deleteMany = originalDeleteMany;
  }
});

test('getFeesByParent returns the current parent’s student fees', async () => {
  const originalFeeFind = Fee.find;
  const originalStudentFind = Student.find;
  const originalUserFindOne = User.findOne;
  const originalIsValid = mongoose.Types.ObjectId.isValid;

  try {
    const feeDocs = [{ _id: 'fee-1', amount: 5000, isPaid: false, student: { _id: 'student-user-1' } }];

    Fee.find = () => ({
      populate: () => feeDocs,
    });
    Student.find = async () => [{ userId: 'student-user-1' }];
    User.findOne = async () => null;
    mongoose.Types.ObjectId.isValid = () => true;

    const req = {
      user: { userId: 'parent-user-1' },
    };

    const res = {
      body: null,
      statusCode: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await feeController.getFeesByParent(req, res);

    assert.deepStrictEqual(res.body, feeDocs);
  } finally {
    Fee.find = originalFeeFind;
    Student.find = originalStudentFind;
    User.findOne = originalUserFindOne;
    mongoose.Types.ObjectId.isValid = originalIsValid;
  }
});

test('payFee defaults to the outstanding balance when no amount is sent', async () => {
  const originalFindById = Fee.findById;
  const originalStudentFindById = Student.findById;

  try {
    const feeDoc = {
      _id: 'fee-3',
      student: { _id: 'student-3' },
      amount: 5000,
      paidAmount: 0,
      paymentHistory: [],
      paymentDetails: {},
      save: async function () {
        return this;
      },
      populate: async function () {
        return this;
      },
    };

    const studentDoc = {
      _id: 'student-3',
      feesPaid: 0,
      save: async function () {
        return this;
      },
    };

    Fee.findById = async () => feeDoc;
    Student.findById = async () => studentDoc;

    const req = {
      body: {
        feeId: 'fee-3',
        paymentMethod: 'Cash',
        transactionId: 'txn-123',
        paymentDetails: {},
      },
    };

    const res = {
      body: null,
      statusCode: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await feeController.payFee(req, res);

    assert.strictEqual(feeDoc.paidAmount, 5000);
    assert.strictEqual(feeDoc.isPaid, true);
    assert.strictEqual(studentDoc.feesPaid, 5000);
    assert.strictEqual(res.statusCode, null);
  } finally {
    Fee.findById = originalFindById;
    Student.findById = originalStudentFindById;
  }
});
