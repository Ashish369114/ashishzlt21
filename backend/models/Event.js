const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: String,
    endTime: String,
    location: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    eventType: {
      type: String,
      enum: ['Sports', 'Cultural', 'Academic', 'Celebration', 'Other', 'Exam', 'CCA', 'PTM', 'Teachers Meeting'],
    },
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
