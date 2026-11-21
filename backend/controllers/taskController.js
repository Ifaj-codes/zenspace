const storeAdapter = require('../config/storeAdapter');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await storeAdapter.getTasks(req.user.id, req.query);
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks.',
      error: err.message,
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status, courseCode } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Task target due date is required.',
      });
    }

    const validPriorities = ['High', 'Medium', 'Low'];
    const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';

    const newTask = await storeAdapter.createTask(req.user.id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: taskPriority,
      dueDate,
      status: status === 'completed' ? 'completed' : 'pending',
      courseCode: courseCode || 'General',
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask,
    });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create task.',
      error: err.message,
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await storeAdapter.updateTask(id, req.user.id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update task.',
      error: err.message,
    });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const toggled = await storeAdapter.toggleTaskStatus(id, req.user.id);

    if (!toggled) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Task marked as ${toggled.status}.`,
      data: toggled,
    });
  } catch (err) {
    console.error('toggleTask error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task status.',
      error: err.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storeAdapter.deleteTask(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: deleted,
    });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task.',
      error: err.message,
    });
  }
};
