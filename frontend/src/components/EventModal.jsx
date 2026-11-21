'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function EventModal({ isOpen, onClose, event, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '10:00',
    endTime: '11:30',
    category: 'Lecture',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        startTime: event.startTime || '10:00',
        endTime: event.endTime || '11:30',
        category: event.category || 'Lecture',
        location: event.location || '',
      });
      setError('');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Event title is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.updateEvent(event._id, form);
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await api.deleteEvent(event._id);
      if (onDeleted) onDeleted(event._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-md shadow-lg border border-border-subtle-light dark:border-border-subtle-dark overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between">
          <span className="font-serif font-medium text-sm text-ink-primary-light dark:text-ink-primary-dark">
            Event Details · <span className="font-mono text-xs text-brand dark:text-brand-dark">{event.category}</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
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
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none font-medium"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab Sessional</option>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
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
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Venue / Room
            </label>
            <input
              type="text"
              placeholder="e.g. Room 302, Academic Building"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border-subtle-light dark:border-border-subtle-dark">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md flex items-center gap-1 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <div className="flex items-center gap-2">
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
