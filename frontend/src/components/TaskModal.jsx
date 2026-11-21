'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function TaskModal({ isOpen, onClose, task, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    status: 'pending',
    courseCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || '',
        status: task.status || 'pending',
        courseCode: task.courseCode || 'General',
      });
      setError('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.updateTask(task._id, form);
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await api.deleteTask(task._id);
      if (onDeleted) onDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await api.toggleTask(task._id);
      if (onUpdated) onUpdated(res.data);
      setForm((prev) => ({ ...prev, status: res.data.status }));
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
            Task Details · <span className="font-mono text-xs text-brand dark:text-brand-dark">{task.courseCode || 'General'}</span>
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
                Due Date *
              </label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none font-medium"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Status
              </label>
              <button
                type="button"
                onClick={handleToggle}
                className={`w-full py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition ${
                  form.status === 'completed'
                    ? 'border-brand text-brand bg-matcha-50 dark:bg-matcha-900/40 dark:text-brand-dark'
                    : 'border-border-subtle-light dark:border-border-subtle-dark text-ink-secondary-light dark:text-ink-secondary-dark bg-surface-muted-light/60 dark:bg-surface-muted-dark/60'
                }`}
              >
                {form.status === 'completed' ? '✓ Completed' : 'Pending'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
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
