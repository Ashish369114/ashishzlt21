const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      createdBy: req.user?.userId,
    });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyExpenses = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const monthly = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: '$_id',
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.json(monthly);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  getMonthlyExpenses,
};
