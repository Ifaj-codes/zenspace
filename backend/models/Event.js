const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: String, // Stored as ISO date string YYYY-MM-DD for reliable calendar matching
    required: [true, 'Event date is required'],
  },
  startTime: {
    type: String, // e.g. "09:00"
    default: '09:00',
  },
  endTime: {
    type: String, // e.g. "10:30"
    default: '10:00',
  },
  category: {
    type: String,
    enum: ['Lecture', 'Exam', 'Assignment', 'Lab', 'Personal'],
    default: 'Lecture',
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
