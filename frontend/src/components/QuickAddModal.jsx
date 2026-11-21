'use client';

import React, { useState } from 'react';
import { X, CheckSquare, Calendar, FileText } from 'lucide-react';
import { api } from '../lib/api';

export default function QuickAddModal({ isOpen, onClose, onCreated, initialTab = 'task' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'High',
    dueDate: todayStr,
    courseCode: 'CSE 324',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: todayStr,
    startTime: '10:00',
    endTime: '11:30',
    category: 'Lecture',
    location: '',
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: 'CSE324, Sessional',
    isPinned: false,
    color: 'default',
  });

  if (!isOpen) return null;

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!taskForm.title.trim()) {
      setError('Task title is required.');
      return;
    }
    setLoading(true);
    try {
      await api.createTask(taskForm);
      onCreated('task');
      onClose();
      setTaskForm({
        title: '',
        description: '',
        priority: 'High',
        dueDate: todayStr,
        courseCode: 'CSE 324',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!eventForm.title.trim()) {
      setError('Event title is required.');
      return;
    }
    setLoading(true);
    try {
      await api.createEvent(eventForm);
      onCreated('event');
      onClose();
      setEventForm({
        title: '',
        description: '',
        date: todayStr,
        startTime: '10:00',
        endTime: '11:30',
        category: 'Lecture',
        location: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!noteForm.title.trim()) {
      setError('Note title is required.');
      return;
    }
    setLoading(true);
    try {
      const tagsArray = noteForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createNote({
        ...noteForm,
        tags: tagsArray,
      });
      onCreated('note');
      onClose();
      setNoteForm({
        title: '',
        content: '',
        tags: 'CSE324, Sessional',
        isPinned: false,
        color: 'default',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-lg shadow-lg border border-border-subtle-light dark:border-border-subtle-dark overflow-hidden">
        {/* Header Tabs */}
        <div className="px-5 pt-4 pb-3 border-b border-border-subtle-light dark:border-border-subtle-dark">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-medium text-base text-ink-primary-light dark:text-ink-primary-dark">
              Quick Capture
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-surface-muted-light dark:bg-surface-muted-dark p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => { setActiveTab('task'); setError(''); }}
              className={`py-1.5 rounded-md transition ${
                activeTab === 'task'
                  ? 'bg-surface-light dark:bg-surface-dark text-brand dark:text-brand-dark font-semibold shadow-xs'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light'
              }`}
            >
              Task
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('event'); setError(''); }}
              className={`py-1.5 rounded-md transition ${
                activeTab === 'event'
                  ? 'bg-surface-light dark:bg-surface-dark text-brand dark:text-brand-dark font-semibold shadow-xs'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light'
              }`}
            >
              Calendar Event
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('note'); setError(''); }}
              className={`py-1.5 rounded-md transition ${
                activeTab === 'note'
                  ? 'bg-surface-light dark:bg-surface-dark text-brand dark:text-brand-dark font-semibold shadow-xs'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light'
              }`}
            >
              Notebook
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Task Form */}
        {activeTab === 'task' && (
          <form onSubmit={handleTaskSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Submit CSE 324 Lab Report 04"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Priority Level *
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none font-medium"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="CSE 324"
                value={taskForm.courseCode}
                onChange={(e) => setTaskForm({ ...taskForm, courseCode: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Key requirements, rubric notes, or instructions..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle-light dark:border-border-subtle-dark">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Create Task'}
              </button>
            </div>
          </form>
        )}

        {/* Event Form */}
        {activeTab === 'event' && (
          <form onSubmit={handleEventSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSE 324 Web Tech Sessional Lab"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Category *
                </label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none font-medium"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab Sessional</option>
                  <option value="Exam">Exam / Midterm</option>
                  <option value="Assignment">Assignment Demo</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Room / Venue
              </label>
              <input
                type="text"
                placeholder="Lab Room 302, Academic Building"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle-light dark:border-border-subtle-dark">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Event'}
              </button>
            </div>
          </form>
        )}

        {/* Note Form */}
        {activeTab === 'note' && (
          <form onSubmit={handleNoteSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Note Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Normalization Rules Cheatsheet"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="CSE324, WebTech, Database"
                value={noteForm.tags}
                onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                rows={4}
                placeholder="Write notes, formulas, or code snippets..."
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle-light dark:border-border-subtle-dark">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
