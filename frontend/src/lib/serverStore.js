import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'zenspace_cse324_jwt_secret_baiust_2026_secure';

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const demoUserId = '664f1a2b3c4d5e6f7a8b9c01';
const hashedPassword = bcrypt.hashSync('password123', 10);

// Global in-memory persistence for serverless runtime
let store = {
  users: [
    {
      _id: demoUserId,
      name: 'Nesar Uddin Ifag',
      email: 'student@baiust.edu.bd',
      passwordHash: hashedPassword,
      studentId: '1119004',
      department: 'CSE',
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
      title: 'Setup ZenSpace Cloud Vercel Deployment',
      description: 'Deploy responsive Next.js frontend and connected API endpoints.',
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
  ],
  notes: [
    {
      _id: generateId(),
      userId: demoUserId,
      title: 'RESTful API Design & HTTP Status Codes',
      content: `### HTTP Status Code Guidelines for ZenSpace API\n\n- **200 OK**: Successful GET, PUT, or PATCH request.\n- **201 Created**: Resource successfully created via POST.\n- **400 Bad Request**: Validation failure.\n- **401 Unauthorized**: Missing or expired JWT bearer token.\n- **404 Not Found**: Entity not found.\n\n> Note: Always return JSON objects with success status.`,
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
      content: `### Normal Forms Summary\n\n1. **1NF**: Atomic values only, no repeating groups.\n2. **2NF**: In 1NF + no partial dependency.\n3. **3NF**: In 2NF + no transitive dependency.\n4. **BCNF**: For every functional dependency X -> Y, X must be a superkey.`,
      tags: ['CSE322', 'Database', 'Exams'],
      isPinned: true,
      color: 'emerald',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export const serverStore = {
  getStore: () => store,
  verifyToken: (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  },
  signToken: (user) => {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        studentId: user.studentId || '1119004',
        department: user.department || 'CSE',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },
  generateId,
};
