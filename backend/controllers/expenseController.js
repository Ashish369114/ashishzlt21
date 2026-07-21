const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { Expense } = require('../models');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
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
    const expenseData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      createdById: req.user?.id,
    };
    const savedExpense = await Expense.create(expenseData);
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    Object.assign(expense, {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    });
    await expense.save();

    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyExpenses = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    
    const monthly = await Expense.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "date"')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        date: {
          [Op.gte]: new Date(`${year}-01-01T00:00:00.000Z`),
          [Op.lte]: new Date(`${year}-12-31T23:59:59.999Z`),
        }
      },
      group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "date"'))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "date"')), 'ASC']]
    });

    const formattedMonthly = monthly.map(m => ({
      month: Number(m.get('month')),
      totalAmount: Number(m.get('totalAmount')),
      count: Number(m.get('count'))
    }));

    res.json(formattedMonthly);
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
