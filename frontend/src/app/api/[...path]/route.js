import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { serverStore } from '../../../lib/serverStore';

// Common auth helper
const getUserFromReq = (request) => {
  const authHeader = request.headers.get('authorization');
  return serverStore.verifyToken(authHeader);
};

export async function GET(request, { params }) {
  const path = params.path || [];
  const fullPath = path.join('/');
  const { searchParams } = new URL(request.url);
  const store = serverStore.getStore();

  // Health check
  if (fullPath === 'health') {
    return NextResponse.json({
      status: 'healthy',
      project: 'ZenSpace: Unified Minimalist Productivity Web Platform',
      student: 'Nesar Uddin Ifag (ID: 1119004)',
      course: 'CSE 324 – Web Technologies Sessional',
      deployment: 'Vercel Serverless Edge Runtime',
      timestamp: new Date().toISOString(),
    });
  }

  // Auth me
  if (fullPath === 'auth/me') {
    const user = getUserFromReq(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const found = store.users.find((u) => u._id === user.id);
    return NextResponse.json({
      success: true,
      data: {
        id: found?._id || user.id,
        name: found?.name || user.name,
        email: found?.email || user.email,
        studentId: found?.studentId || user.studentId,
        department: found?.department || user.department,
      },
    });
  }

  // Protected data access below
  const user = getUserFromReq(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Sync Overview
  if (fullPath === 'sync/overview') {
    const today = new Date().toISOString().split('T')[0];
    const userTasks = store.tasks.filter((t) => t.userId === user.id);
    const userEvents = store.events.filter((e) => e.userId === user.id);
    const userNotes = store.notes.filter((n) => n.userId === user.id);

    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = userTasks.filter((t) => t.status === 'pending');
    const highPriorityPending = pendingTasks.filter((t) => t.priority === 'High').length;
    const todayTasks = userTasks.filter((t) => t.dueDate === today);
    const todayEvents = userEvents.filter((e) => e.date === today);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasksCount: pendingTasks.length,
          highPriorityPending,
          todayTasksCount: todayTasks.length,
          todayEventsCount: todayEvents.length,
          totalNotes: userNotes.length,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        todaySchedule: {
          date: today,
          events: todayEvents,
          tasksDue: todayTasks,
        },
        recentNotes: userNotes.slice(0, 4),
        pinnedNotes: userNotes.filter((n) => n.isPinned),
      },
    });
  }

  // Sync Calendar
  if (fullPath === 'sync/calendar') {
    const month = searchParams.get('month');
    let events = store.events.filter((e) => e.userId === user.id);
    let tasks = store.tasks.filter((t) => t.userId === user.id);

    if (month) {
      events = events.filter((e) => e.date && e.date.startsWith(month));
      tasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(month));
    }

    const taskDeadlines = tasks.map((t) => ({
      _id: `task-deadline-${t._id}`,
      originalTaskId: t._id,
      itemType: 'task-deadline',
      title: t.title,
      description: t.description,
      date: t.dueDate,
      priority: t.priority,
      status: t.status,
      courseCode: t.courseCode,
      category: 'Deadline',
      isTaskDeadline: true,
    }));

    const formattedEvents = events.map((e) => ({
      _id: e._id,
      itemType: 'event',
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      category: e.category,
      location: e.location,
      isTaskDeadline: false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        taskDeadlines,
        combined: [...formattedEvents, ...taskDeadlines],
      },
    });
  }

  // Get Tasks
  if (fullPath === 'tasks') {
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let list = store.tasks.filter((t) => t.userId === user.id);
    if (priority && priority !== 'All') list = list.filter((t) => t.priority === priority);
    if (status && status !== 'All') list = list.filter((t) => t.status === status);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(s));
    }
    return NextResponse.json({ success: true, data: list });
  }

  // Get Events
  if (fullPath === 'events') {
    const category = searchParams.get('category');
    let list = store.events.filter((e) => e.userId === user.id);
    if (category && category !== 'All') list = list.filter((e) => e.category === category);
    return NextResponse.json({ success: true, data: list });
  }

  // Get Notes
  if (fullPath === 'notes') {
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    let list = store.notes.filter((n) => n.userId === user.id);
    if (tag && tag !== 'All') list = list.filter((n) => n.tags && n.tags.includes(tag));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
    }

    const tagsSet = new Set();
    store.notes.forEach((n) => n.tags?.forEach((t) => tagsSet.add(t)));

    return NextResponse.json({
      success: true,
      availableTags: Array.from(tagsSet),
      data: list,
    });
  }

  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

export async function POST(request, { params }) {
  const path = params.path || [];
  const fullPath = path.join('/');
  const store = serverStore.getStore();
  const body = await request.json().catch(() => ({}));

  // Login
  if (fullPath === 'auth/login') {
    const { email, password } = body;
    const found = store.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!found) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }
    const match = bcrypt.compareSync(password, found.passwordHash);
    if (!match) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }
    const token = serverStore.signToken(found);
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: found._id,
          name: found.name,
          email: found.email,
          studentId: found.studentId,
          department: found.department,
        },
      },
    });
  }

  // Register
  if (fullPath === 'auth/register') {
    const { name, email, password, studentId, department } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    const exists = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }
    const newUser = {
      _id: serverStore.generateId(),
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      studentId: studentId || '1119004',
      department: department || 'CSE',
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    const token = serverStore.signToken(newUser);
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          studentId: newUser.studentId,
          department: newUser.department,
        },
      },
    });
  }

  // Reseed demo data
  if (fullPath === 'auth/reseed') {
    return NextResponse.json({ success: true, message: 'Demo reset' });
  }

  // Protected operations
  const user = getUserFromReq(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Create Task
  if (fullPath === 'tasks') {
    const newTask = {
      _id: serverStore.generateId(),
      userId: user.id,
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'Medium',
      dueDate: body.dueDate,
      status: body.status || 'pending',
      courseCode: body.courseCode || 'General',
      createdAt: new Date().toISOString(),
    };
    store.tasks.unshift(newTask);
    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  }

  // Create Event
  if (fullPath === 'events') {
    const newEvent = {
      _id: serverStore.generateId(),
      userId: user.id,
      title: body.title,
      description: body.description || '',
      date: body.date,
      startTime: body.startTime || '09:00',
      endTime: body.endTime || '10:00',
      category: body.category || 'Lecture',
      location: body.location || '',
      createdAt: new Date().toISOString(),
    };
    store.events.unshift(newEvent);
    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  }

  // Create Note
  if (fullPath === 'notes') {
    const cleanTags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === 'string'
      ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newNote = {
      _id: serverStore.generateId(),
      userId: user.id,
      title: body.title,
      content: body.content || '',
      tags: cleanTags,
      isPinned: Boolean(body.isPinned),
      color: body.color || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.notes.unshift(newNote);
    return NextResponse.json({ success: true, data: newNote }, { status: 201 });
  }

  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const path = params.path || [];
  const user = getUserFromReq(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const store = serverStore.getStore();
  const body = await request.json().catch(() => ({}));

  // Update Task: /api/tasks/[id]
  if (path[0] === 'tasks' && path[1]) {
    const idx = store.tasks.findIndex((t) => t._id === path[1]);
    if (idx !== -1) {
      store.tasks[idx] = { ...store.tasks[idx], ...body };
      return NextResponse.json({ success: true, data: store.tasks[idx] });
    }
  }

  // Update Event: /api/events/[id]
  if (path[0] === 'events' && path[1]) {
    const idx = store.events.findIndex((e) => e._id === path[1]);
    if (idx !== -1) {
      store.events[idx] = { ...store.events[idx], ...body };
      return NextResponse.json({ success: true, data: store.events[idx] });
    }
  }

  // Update Note: /api/notes/[id]
  if (path[0] === 'notes' && path[1]) {
    const idx = store.notes.findIndex((n) => n._id === path[1]);
    if (idx !== -1) {
      store.notes[idx] = { ...store.notes[idx], ...body, updatedAt: new Date().toISOString() };
      return NextResponse.json({ success: true, data: store.notes[idx] });
    }
  }

  return NextResponse.json({ success: false, message: 'Entity not found' }, { status: 404 });
}

export async function PATCH(request, { params }) {
  const path = params.path || [];
  const user = getUserFromReq(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const store = serverStore.getStore();

  // Toggle Task: /api/tasks/[id]/toggle
  if (path[0] === 'tasks' && path[1] && path[2] === 'toggle') {
    const task = store.tasks.find((t) => t._id === path[1]);
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      return NextResponse.json({ success: true, data: task });
    }
  }

  return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}

export async function DELETE(request, { params }) {
  const path = params.path || [];
  const user = getUserFromReq(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const store = serverStore.getStore();

  if (path[0] === 'tasks' && path[1]) {
    store.tasks = store.tasks.filter((t) => t._id !== path[1]);
    return NextResponse.json({ success: true, message: 'Deleted' });
  }

  if (path[0] === 'events' && path[1]) {
    store.events = store.events.filter((e) => e._id !== path[1]);
    return NextResponse.json({ success: true, message: 'Deleted' });
  }

  if (path[0] === 'notes' && path[1]) {
    store.notes = store.notes.filter((n) => n._id !== path[1]);
    return NextResponse.json({ success: true, message: 'Deleted' });
  }

  return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}
