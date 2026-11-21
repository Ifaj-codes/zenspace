const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { getMongoStatus } = require('./db');

const User = require('../models/User');
const Task = require('../models/Task');
const Event = require('../models/Event');
const Note = require('../models/Note');

const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Generate unique ID helper
const generateId = () => new mongoose.Types.ObjectId().toString();

// Calculate dates relative to today for dynamic realistic demo data
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Seed initial default demo data for student Nesar Uddin Ifag
const getInitialStore = () => {
  const demoUserId = '664f1a2b3c4d5e6f7a8b9c01';
  const hashedPassword = bcrypt.hashSync('password123', 10);

  return {
    users: [
      {
        _id: demoUserId,
        name: 'Nesar Uddin Ifag',
        email: 'student@baiust.edu.bd',
        passwordHash: hashedPassword,
        studentId: '1119004',
        department: 'CSE',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Submit CSE 324 Lab Report 04 (Web Tech)',
        description: 'Prepare complete technical documentation with system architecture, ER diagrams, and REST API testing logs.',
        priority: 'High',
        dueDate: getRelativeDate(1),
        status: 'pending',
        courseCode: 'CSE 324',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Revise Normalization & BCNF for Midterm',
        description: 'Complete 3NF and BCNF decomposition practice problems from Korth Chapter 7.',
        priority: 'High',
        dueDate: getRelativeDate(3),
        status: 'pending',
        courseCode: 'CSE 322',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Network Socket Programming Assignment',
        description: 'Implement multi-client TCP echo server in Python with error handling.',
        priority: 'Medium',
        dueDate: getRelativeDate(5),
        status: 'pending',
        courseCode: 'CSE 323',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Setup ZenSpace MongoDB Atlas Database Cluster',
        description: 'Configure network access whitelist and copy connection string to backend .env.',
        priority: 'Low',
        dueDate: getRelativeDate(-1),
        status: 'completed',
        courseCode: 'CSE 324',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Prepare Presentation Slides for Yeakob Ali Sir',
        description: 'Design 10 clean slides highlighting three-tier architecture and task-calendar sync.',
        priority: 'Medium',
        dueDate: getRelativeDate(7),
        status: 'pending',
        courseCode: 'CSE 324',
        createdAt: new Date().toISOString(),
      },
    ],
    events: [
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'CSE 324 Web Technologies Sessional Lab',
        description: 'Lab evaluation on Next.js frontend, Express backend, and MongoDB CRUD operations.',
        date: getRelativeDate(0),
        startTime: '10:00',
        endTime: '13:00',
        category: 'Lab',
        location: 'Lab Room 302, Academic Building',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'CSE 321 Operating Systems Midterm Exam',
        description: 'Covers CPU scheduling algorithms, semaphore synchronization, and deadlock prevention.',
        date: getRelativeDate(3),
        startTime: '09:30',
        endTime: '11:30',
        category: 'Exam',
        location: 'Auditorium Hall B',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'CSE 323 Computer Networks Lecture',
        description: 'Subnetting, CIDR notation, and Distance Vector Routing protocols.',
        date: getRelativeDate(2),
        startTime: '11:30',
        endTime: '13:00',
        category: 'Lecture',
        location: 'Room 405',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Web Tech Term Project Prototype Demo',
        description: 'Project demonstration of ZenSpace unified dashboard to course instructor.',
        date: getRelativeDate(5),
        startTime: '14:00',
        endTime: '16:00',
        category: 'Assignment',
        location: 'Faculty Office, Dept of CSE',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Weekend Gym & Badminton Match',
        description: 'Relaxation and physical activity after intensive coding sprints.',
        date: getRelativeDate(6),
        startTime: '16:30',
        endTime: '18:00',
        category: 'Personal',
        location: 'University Gymnasium',
        createdAt: new Date().toISOString(),
      },
    ],
    notes: [
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'RESTful API Design & HTTP Status Codes',
        content: `### HTTP Status Code Guidelines for ZenSpace API\n\n- **200 OK**: Successful GET, PUT, or PATCH request.\n- **201 Created**: Resource successfully created via POST.\n- **400 Bad Request**: Validation failure (e.g., missing title or due date).\n- **401 Unauthorized**: Missing or expired JWT bearer token.\n- **403 Forbidden**: Token valid but user not authorized for resource.\n- **404 Not Found**: Entity does not exist for the current user.\n- **500 Internal Server Error**: Uncaught exception on the Express server.\n\n> Note: Always return JSON objects with \`success: boolean\` and detailed message.`,
        tags: ['CSE324', 'WebTech', 'API', 'REST'],
        isPinned: true,
        color: 'indigo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Database Normalization Quick Cheatsheet',
        content: `### Normal Forms Summary\n\n1. **1NF**: Atomic values only, no repeating groups.\n2. **2NF**: In 1NF + no partial dependency (non-prime attributes fully dependent on candidate key).\n3. **3NF**: In 2NF + no transitive dependency (X -> Y, where Y is non-prime attribute and X is not superkey).\n4. **BCNF**: For every functional dependency X -> Y, X must be a superkey.\n\n*Important for CSE 322 Midterm exam revision!*`,
        tags: ['CSE322', 'Database', 'Exams'],
        isPinned: true,
        color: 'emerald',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        userId: demoUserId,
        title: 'Three-Tier Architecture Benefits for ZenSpace',
        content: `### Key Academic Defense Points\n\n- **Presentation Tier**: Next.js 14 / React provides modular UI components, instant responsiveness, and client-side caching.\n- **Application Tier**: Express.js server handles authentication, validation, and task-to-calendar deadline synchronization.\n- **Data Tier**: MongoDB Atlas manages document storage with flexible schemas and indexed queries via Mongoose.`,
        tags: ['Project', 'Architecture', 'CSE324'],
        isPinned: false,
        color: 'amber',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};

const loadStore = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = getInitialStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    const initial = getInitialStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
};

const saveStore = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Unified Data Access Interface
const storeAdapter = {
  // USER METHODS
  async findUserByEmail(email) {
    if (getMongoStatus()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    const store = loadStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (getMongoStatus()) {
      return await User.findById(id).select('-passwordHash');
    }
    const store = loadStore();
    const user = store.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  },

  async createUser({ name, email, password, studentId, department }) {
    const passwordHash = await bcrypt.hash(password, 10);
    if (getMongoStatus()) {
      const user = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
        studentId: studentId || '1119004',
        department: department || 'CSE',
      });
      return await user.save();
    }
    const store = loadStore();
    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      studentId: studentId || '1119004',
      department: department || 'CSE',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveStore(store);
    return newUser;
  },

  // TASK METHODS
  async getTasks(userId, query = {}) {
    if (getMongoStatus()) {
      const filter = { userId };
      if (query.priority && query.priority !== 'All') filter.priority = query.priority;
      if (query.status && query.status !== 'All') filter.status = query.status;
      if (query.search) {
        filter.title = { $regex: query.search, $options: 'i' };
      }
      return await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
    }
    const store = loadStore();
    let tasks = store.tasks.filter((t) => t.userId.toString() === userId.toString());
    if (query.priority && query.priority !== 'All') {
      tasks = tasks.filter((t) => t.priority === query.priority);
    }
    if (query.status && query.status !== 'All') {
      tasks = tasks.filter((t) => t.status === query.status);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s)));
    }
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  },

  async createTask(userId, data) {
    if (getMongoStatus()) {
      const task = new Task({ ...data, userId });
      return await task.save();
    }
    const store = loadStore();
    const newTask = {
      _id: generateId(),
      userId: userId.toString(),
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate,
      status: data.status || 'pending',
      courseCode: data.courseCode || 'General',
      createdAt: new Date().toISOString(),
    };
    store.tasks.push(newTask);
    saveStore(store);
    return newTask;
  },

  async updateTask(id, userId, updates) {
    if (getMongoStatus()) {
      return await Task.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    }
    const store = loadStore();
    const index = store.tasks.findIndex((t) => t._id.toString() === id.toString() && t.userId.toString() === userId.toString());
    if (index === -1) return null;
    store.tasks[index] = { ...store.tasks[index], ...updates };
    saveStore(store);
    return store.tasks[index];
  },

  async toggleTaskStatus(id, userId) {
    if (getMongoStatus()) {
      const task = await Task.findOne({ _id: id, userId });
      if (!task) return null;
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      task.completedAt = task.status === 'completed' ? new Date() : null;
      return await task.save();
    }
    const store = loadStore();
    const task = store.tasks.find((t) => t._id.toString() === id.toString() && t.userId.toString() === userId.toString());
    if (!task) return null;
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date().toISOString() : null;
    saveStore(store);
    return task;
  },

  async deleteTask(id, userId) {
    if (getMongoStatus()) {
      return await Task.findOneAndDelete({ _id: id, userId });
    }
    const store = loadStore();
    const index = store.tasks.findIndex((t) => t._id.toString() === id.toString() && t.userId.toString() === userId.toString());
    if (index === -1) return null;
    const deleted = store.tasks.splice(index, 1)[0];
    saveStore(store);
    return deleted;
  },

  // EVENT METHODS
  async getEvents(userId, query = {}) {
    if (getMongoStatus()) {
      const filter = { userId };
      if (query.category && query.category !== 'All') filter.category = query.category;
      if (query.month) {
        // e.g. "2026-11"
        filter.date = { $regex: `^${query.month}` };
      }
      return await Event.find(filter).sort({ date: 1, startTime: 1 });
    }
    const store = loadStore();
    let events = store.events.filter((e) => e.userId.toString() === userId.toString());
    if (query.category && query.category !== 'All') {
      events = events.filter((e) => e.category === query.category);
    }
    if (query.month) {
      events = events.filter((e) => e.date.startsWith(query.month));
    }
    return events.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  },

  async createEvent(userId, data) {
    if (getMongoStatus()) {
      const event = new Event({ ...data, userId });
      return await event.save();
    }
    const store = loadStore();
    const newEvent = {
      _id: generateId(),
      userId: userId.toString(),
      title: data.title,
      description: data.description || '',
      date: data.date,
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '10:00',
      category: data.category || 'Lecture',
      location: data.location || '',
      createdAt: new Date().toISOString(),
    };
    store.events.push(newEvent);
    saveStore(store);
    return newEvent;
  },

  async updateEvent(id, userId, updates) {
    if (getMongoStatus()) {
      return await Event.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    }
    const store = loadStore();
    const index = store.events.findIndex((e) => e._id.toString() === id.toString() && e.userId.toString() === userId.toString());
    if (index === -1) return null;
    store.events[index] = { ...store.events[index], ...updates };
    saveStore(store);
    return store.events[index];
  },

  async deleteEvent(id, userId) {
    if (getMongoStatus()) {
      return await Event.findOneAndDelete({ _id: id, userId });
    }
    const store = loadStore();
    const index = store.events.findIndex((e) => e._id.toString() === id.toString() && e.userId.toString() === userId.toString());
    if (index === -1) return null;
    const deleted = store.events.splice(index, 1)[0];
    saveStore(store);
    return deleted;
  },

  // NOTE METHODS
  async getNotes(userId, query = {}) {
    if (getMongoStatus()) {
      const filter = { userId };
      if (query.tag && query.tag !== 'All') filter.tags = query.tag;
      if (query.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: 'i' } },
          { content: { $regex: query.search, $options: 'i' } },
        ];
      }
      return await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    }
    const store = loadStore();
    let notes = store.notes.filter((n) => n.userId.toString() === userId.toString());
    if (query.tag && query.tag !== 'All') {
      notes = notes.filter((n) => n.tags && n.tags.includes(query.tag));
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      notes = notes.filter((n) => n.title.toLowerCase().includes(s) || (n.content && n.content.toLowerCase().includes(s)));
    }
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
  },

  async createNote(userId, data) {
    if (getMongoStatus()) {
      const note = new Note({ ...data, userId });
      return await note.save();
    }
    const store = loadStore();
    const newNote = {
      _id: generateId(),
      userId: userId.toString(),
      title: data.title,
      content: data.content || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      isPinned: Boolean(data.isPinned),
      color: data.color || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.notes.push(newNote);
    saveStore(store);
    return newNote;
  },

  async updateNote(id, userId, updates) {
    if (getMongoStatus()) {
      return await Note.findOneAndUpdate(
        { _id: id, userId },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    }
    const store = loadStore();
    const index = store.notes.findIndex((n) => n._id.toString() === id.toString() && n.userId.toString() === userId.toString());
    if (index === -1) return null;
    store.notes[index] = {
      ...store.notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    return store.notes[index];
  },

  async deleteNote(id, userId) {
    if (getMongoStatus()) {
      return await Note.findOneAndDelete({ _id: id, userId });
    }
    const store = loadStore();
    const index = store.notes.findIndex((n) => n._id.toString() === id.toString() && n.userId.toString() === userId.toString());
    if (index === -1) return null;
    const deleted = store.notes.splice(index, 1)[0];
    saveStore(store);
    return deleted;
  },

  // Reset or reseed demo data
  reseedDemo() {
    const initial = getInitialStore();
    saveStore(initial);
    return initial;
  },
};

module.exports = storeAdapter;
