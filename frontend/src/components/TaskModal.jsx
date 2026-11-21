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
    if (!confirm('Delete this task?')) return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-md shadow-xl border border-hairline-light dark:border-hairline-dark overflow-hidden">
        <div className="px-5 py-3.5 border-b border-hairline-light dark:border-hairline-dark flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
            Task Inspector // {task.courseCode || 'General'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded bg-vermilion-bg dark:bg-vermilion-bg-dark border border-vermilion/30 text-vermilion dark:text-vermilion-dark text-xs font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-ink-primary-light outline-none"
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
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              >
                <option value="High">HIGH</option>
                <option value="Medium">MEDIUM</option>
                <option value="Low">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                Status Toggle
              </label>
              <button
                type="button"
                onClick={handleToggle}
                className={`w-full py-1.5 px-3 text-xs font-mono font-semibold rounded border flex items-center justify-center gap-1.5 transition ${
                  form.status === 'completed'
                    ? 'border-pine text-pine bg-pine-bg dark:bg-pine-bg-dark'
                    : 'border-hairline-light dark:border-hairline-dark text-ink-secondary-light dark:text-ink-secondary-dark bg-surface-subtle-light dark:bg-surface-subtle-dark'
                }`}
              >
                {form.status === 'completed' ? '✓ Completed' : 'Pending'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-hairline-light dark:border-hairline-dark">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-mono text-vermilion hover:bg-vermilion-bg dark:hover:bg-vermilion-bg-dark rounded flex items-center gap-1 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <div className="flex items-center gap-2">
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
                className="px-4 py-1.5 text-xs font-mono font-semibold rounded bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark hover:opacity-90 shadow-tactile transition disabled:opacity-50"
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
