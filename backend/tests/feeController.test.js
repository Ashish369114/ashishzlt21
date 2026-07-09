const test = require('node:test');
const assert = require('assert');
const feeController = require('../controllers/feeController');
const Fee = require('../models/Fee');

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
