const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Expense = require('./models/Expense');
const School = require('./models/School');
const User = require('./models/User');

const seedExpenses = async () => {
  try {
    await connectDB();
    const defaultSchool = await School.findOne();
    const superAdmin = await User.findOne();

    if (!defaultSchool || !superAdmin) {
      console.error('School or Admin not found');
      process.exit(1);
    }

    const expensesData = [
      {
        title: 'Office Supplies',
        category: 'Stationery',
        amount: 2500,
        date: new Date('2026-07-01'),
        description: 'Pens, paper, and staplers',
        expenseType: 'Operational',
        createdBy: superAdmin._id,
        school: defaultSchool._id,
      },
      {
        title: 'Internet Bill',
        category: 'Utilities',
        amount: 5000,
        date: new Date('2026-07-05'),
        description: 'Monthly broadband internet',
        expenseType: 'Operational',
        createdBy: superAdmin._id,
        school: defaultSchool._id,
      },
      {
        title: 'New Whiteboards',
        category: 'Furniture',
        amount: 15000,
        date: new Date('2026-07-10'),
        description: 'Purchased 5 new whiteboards for classrooms',
        expenseType: 'Capital',
        createdBy: superAdmin._id,
        school: defaultSchool._id,
      },
      {
        title: 'School Event Catering',
        category: 'Events',
        amount: 12000,
        date: new Date('2026-07-12'),
        description: 'Catering for the annual sports day',
        expenseType: 'Miscellaneous',
        createdBy: superAdmin._id,
        school: defaultSchool._id,
      }
    ];

    await Expense.insertMany(expensesData);
    console.log('Successfully inserted expenses data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding expenses:', error);
    process.exit(1);
  }
};

seedExpenses();
