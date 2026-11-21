const storeAdapter = require('../config/storeAdapter');

exports.getEvents = async (req, res) => {
  try {
    const events = await storeAdapter.getEvents(req.user.id, req.query);
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error('getEvents error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events.',
      error: err.message,
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, category, location } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event title is required.',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Event date is required.',
      });
    }

    const validCategories = ['Lecture', 'Exam', 'Assignment', 'Lab', 'Personal'];
    const eventCategory = validCategories.includes(category) ? category : 'Lecture';

    const newEvent = await storeAdapter.createEvent(req.user.id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      date,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      category: eventCategory,
      location: location ? location.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: newEvent,
    });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create event.',
      error: err.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await storeAdapter.updateEvent(id, req.user.id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update event.',
      error: err.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storeAdapter.deleteEvent(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
      data: deleted,
    });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event.',
      error: err.message,
    });
  }
};
