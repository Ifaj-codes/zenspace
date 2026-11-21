const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('zenspace_token');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('zenspace_token', token);
    } else {
      localStorage.removeItem('zenspace_token');
    }
  }
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear invalid token
      if (response.status === 401 && typeof window !== 'undefined') {
        // localStorage.removeItem('zenspace_token');
      }
      throw new Error(data.message || 'An error occurred during API request.');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  reseedDemo: () =>
    request('/auth/reseed', {
      method: 'POST',
    }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },

  createTask: (taskData) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  updateTask: (id, updates) =>
    request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  toggleTask: (id) =>
    request(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    }),

  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/events${query ? `?${query}` : ''}`);
  },

  createEvent: (eventData) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (id, updates) =>
    request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteEvent: (id) =>
    request(`/events/${id}`, {
      method: 'DELETE',
    }),

  // Notes
  getNotes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notes${query ? `?${query}` : ''}`);
  },

  createNote: (noteData) =>
    request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    }),

  updateNote: (id, updates) =>
    request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteNote: (id) =>
    request(`/notes/${id}`, {
      method: 'DELETE',
    }),

  // Synchronization & Dashboard
  getCalendarSync: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/sync/calendar${query ? `?${query}` : ''}`);
  },

  getDashboardOverview: () => request('/sync/overview'),

  getHealth: () => request('/health'),
};
