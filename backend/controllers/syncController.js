const storeAdapter = require('../config/storeAdapter');

exports.getCalendarSync = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-11"
    const userId = req.user.id;

    // Fetch user events and tasks
    const events = await storeAdapter.getEvents(userId, month ? { month } : {});
    const tasks = await storeAdapter.getTasks(userId, {});

    // Filter tasks if month is provided
    const relevantTasks = month
      ? tasks.filter((t) => t.dueDate && t.dueDate.startsWith(month))
      : tasks;

    // Map tasks into calendar deadline items
    const taskDeadlines = relevantTasks.map((t) => ({
      _id: `task-deadline-${t._id}`,
      originalTaskId: t._id,
      itemType: 'task-deadline',
      title: t.title,
      description: t.description,
      date: t.dueDate,
      priority: t.priority, // High, Medium, Low
      status: t.status, // pending, completed
      courseCode: t.courseCode,
      category: 'Deadline',
      isTaskDeadline: true,
    }));

    // Format native events
    const formattedEvents = events.map((e) => ({
      _id: e._id,
      itemType: 'event',
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      category: e.category, // Lecture, Exam, Assignment, Lab, Personal
      location: e.location,
      isTaskDeadline: false,
    }));

    // Combine both streams
    const allCalendarItems = [...formattedEvents, ...taskDeadlines].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });

    res.status(200).json({
      success: true,
      month: month || 'all',
      totalItems: allCalendarItems.length,
      eventsCount: formattedEvents.length,
      deadlinesCount: taskDeadlines.length,
      data: {
        events: formattedEvents,
        taskDeadlines: taskDeadlines,
        combined: allCalendarItems,
      },
    });
  } catch (err) {
    console.error('getCalendarSync error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize calendar and tasks.',
      error: err.message,
    });
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [tasks, events, notes] = await Promise.all([
      storeAdapter.getTasks(userId, {}),
      storeAdapter.getEvents(userId, {}),
      storeAdapter.getNotes(userId, {}),
    ]);

    // Task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    const highPriorityPending = pendingTasks.filter((t) => t.priority === 'High').length;
    const mediumPriorityPending = pendingTasks.filter((t) => t.priority === 'Medium').length;
    const lowPriorityPending = pendingTasks.filter((t) => t.priority === 'Low').length;

    // Deadlines due today or overdue
    const overdueTasks = pendingTasks.filter((t) => t.dueDate < today);
    const todayTasks = tasks.filter((t) => t.dueDate === today);

    // Today's events
    const todayEvents = events.filter((e) => e.date === today);

    // Next 7 days upcoming items
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

    const upcomingEvents = events
      .filter((e) => e.date >= today && e.date <= sevenDaysStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    const upcomingDeadlines = pendingTasks
      .filter((t) => t.dueDate >= today && t.dueDate <= sevenDaysStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    // Pinned and recent notes
    const pinnedNotes = notes.filter((n) => n.isPinned);
    const recentNotes = notes.slice(0, 4);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasksCount: pendingTasks.length,
          highPriorityPending,
          mediumPriorityPending,
          lowPriorityPending,
          overdueCount: overdueTasks.length,
          todayTasksCount: todayTasks.length,
          todayEventsCount: todayEvents.length,
          totalNotes: notes.length,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        todaySchedule: {
          date: today,
          events: todayEvents,
          tasksDue: todayTasks,
        },
        upcoming: {
          next7DaysEvents: upcomingEvents,
          next7DaysDeadlines: upcomingDeadlines,
        },
        recentNotes,
        pinnedNotes,
      },
    });
  } catch (err) {
    console.error('getDashboardOverview error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview.',
      error: err.message,
    });
  }
};
