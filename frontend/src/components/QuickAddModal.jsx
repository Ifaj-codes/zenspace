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
      await api.createNote(noteForm);
      onCreated('note');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-lg shadow-xl border border-hairline-light dark:border-hairline-dark overflow-hidden">
        {/* Header with Segmented Tabs */}
        <div className="px-5 pt-4 pb-3 border-b border-hairline-light dark:border-hairline-dark">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
              Quick Capture // ZenSpace
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-surface-subtle-light dark:bg-surface-subtle-dark p-1 rounded-md font-mono text-xs">
            <button
              type="button"
              onClick={() => { setActiveTab('task'); setError(''); }}
              className={`py-1 rounded font-medium transition ${
                activeTab === 'task'
                  ? 'bg-surface-light dark:bg-surface-dark text-ink-primary-light dark:text-ink-primary-dark shadow-tactile font-bold'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark'
              }`}
            >
              [Task]
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('event'); setError(''); }}
              className={`py-1 rounded font-medium transition ${
                activeTab === 'event'
                  ? 'bg-surface-light dark:bg-surface-dark text-ink-primary-light dark:text-ink-primary-dark shadow-tactile font-bold'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark'
              }`}
            >
              [Event]
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('note'); setError(''); }}
              className={`py-1 rounded font-medium transition ${
                activeTab === 'note'
                  ? 'bg-surface-light dark:bg-surface-dark text-ink-primary-light dark:text-ink-primary-dark shadow-tactile font-bold'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark'
              }`}
            >
              [Note]
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded bg-vermilion-bg dark:bg-vermilion-bg-dark border border-vermilion/30 text-vermilion dark:text-vermilion-dark text-xs font-mono">
            {error}
          </div>
        )}

        {/* Task Form */}
        {activeTab === 'task' && (
          <form onSubmit={handleTaskSubmit} className="p-5 space-y-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Submit CSE 324 Lab Report 04"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-ink-primary-light outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Priority Level *
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                >
                  <option value="High">HIGH [CRITICAL]</option>
                  <option value="Medium">MEDIUM [STANDARD]</option>
                  <option value="Low">LOW [BACKLOG]</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="CSE 324"
                value={taskForm.courseCode}
                onChange={(e) => setTaskForm({ ...taskForm, courseCode: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Key requirements or links..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-hairline-light dark:border-hairline-dark">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-mono text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-mono font-semibold rounded bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark hover:opacity-90 shadow-tactile transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Committing...' : 'Commit to Schedule'}
              </button>
            </div>
          </form>
        )}

        {/* Event Form */}
        {activeTab === 'event' && (
          <form onSubmit={handleEventSubmit} className="p-5 space-y-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSE 324 Web Tech Sessional Lab"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Category *
                </label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
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
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Room / Venue
              </label>
              <input
                type="text"
                placeholder="Lab Room 302, Academic Building"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-hairline-light dark:border-hairline-dark">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-mono text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-mono font-semibold rounded bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark hover:opacity-90 shadow-tactile transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Event'}
              </button>
            </div>
          </form>
        )}

        {/* Note Form */}
        {activeTab === 'note' && (
          <form onSubmit={handleNoteSubmit} className="p-5 space-y-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Note Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Normalization Rules Cheatsheet"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="CSE324, WebTech"
                value={noteForm.tags}
                onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                rows={4}
                placeholder="Write notes, formulas, or code snippets..."
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-hairline-light dark:border-hairline-dark">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-mono text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-mono font-semibold rounded bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark hover:opacity-90 shadow-tactile transition active:scale-95 disabled:opacity-50"
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
