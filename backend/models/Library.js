const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publisher: String,
    publicationYear: Number,
    category: {
      type: String,
      enum: ['fiction', 'non-fiction', 'reference', 'textbook', 'biography', 'other'],
    },
    subject: String,
    description: String,
    totalCopies: {
      type: Number,
      required: true,
    },
    availableCopies: {
      type: Number,
      required: true,
    },
    location: {
      shelfNumber: String,
      section: String,
    },
    price: Number,
    procurementDate: Date,
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    borrowHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        borrowDate: Date,
        dueDate: Date,
        returnDate: Date,
        fine: Number,
        status: {
          type: String,
          enum: ['borrowed', 'returned', 'overdue'],
        },
      },
    ],
    status: {
      type: String,
      enum: ['available', 'damaged', 'lost', 'maintenance'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Library', librarySchema);
