'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Pin,
  Trash2,
  Bold,
  Italic,
  Heading,
  List,
  Code,
  Eye,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';

export default function NoteModal({ isOpen, onClose, note, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    isPinned: false,
    color: 'default',
  });
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title || '',
        content: note.content || '',
        tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        isPinned: Boolean(note.isPinned),
        color: note.color || 'default',
      });
      setError('');
      setIsPreview(false);
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('note-modal-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = textarea.value;
    const selected = prev.substring(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    const nextContent = prev.substring(0, start) + replacement + prev.substring(end);
    setForm({ ...form, content: nextContent });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Note title is required.');
      return;
    }
    setLoading(true);
    try {
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.updateNote(note._id, {
        title: form.title,
        content: form.content,
        tags: tagsArray,
        isPinned: form.isPinned,
        color: form.color,
      });

      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    setLoading(true);
    try {
      await api.deleteNote(note._id);
      if (onDeleted) onDeleted(note._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return '<p class="text-ink-muted-light dark:text-ink-muted-dark italic">Empty note.</p>';
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold font-mono my-2 text-ink-primary-light dark:text-ink-primary-dark uppercase">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-sm font-semibold my-2 text-ink-primary-light dark:text-ink-primary-dark">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-base font-bold my-3 text-ink-primary-light dark:text-ink-primary-dark">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-brand dark:border-brand-dark pl-2.5 py-0.5 my-2 italic text-ink-secondary-light dark:text-ink-secondary-dark">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\`(.*?)\`/gim, '<code class="px-1 py-0.5 rounded bg-surface-muted-light dark:bg-surface-muted-dark font-mono text-[11px]">$1</code>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-xs my-0.5">$1</li>')
      .replace(/\n$/gim, '<br />')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-xl shadow-lg border border-border-subtle-light dark:border-border-subtle-dark overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-3.5 border-b border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
              title={form.isPinned ? 'Unpin note' : 'Pin note'}
              className={`p-1 rounded-md transition ${
                form.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light'
              }`}
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </button>
            <span className="font-serif font-medium text-sm text-ink-primary-light dark:text-ink-primary-dark">
              Study Note
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-muted-light dark:bg-surface-muted-dark rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-2.5 py-1 rounded-md transition ${
                  !isPreview ? 'bg-surface-light dark:bg-surface-dark text-brand dark:text-brand-dark font-semibold shadow-xs' : 'text-ink-muted-light'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-2.5 py-1 rounded-md transition ${
                  isPreview ? 'bg-surface-light dark:bg-surface-dark text-brand dark:text-brand-dark font-semibold shadow-xs' : 'text-ink-muted-light'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          <div>
            <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none focus:border-brand dark:focus:border-brand-dark transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
            />
          </div>

          {!isPreview ? (
            <div>
              <div className="flex items-center gap-1 mb-1.5 p-1 bg-surface-muted-light dark:bg-surface-muted-dark rounded-lg border border-border-subtle-light dark:border-border-subtle-dark text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="px-2 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px] font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="px-2 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px] italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="px-2 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="px-2 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`')}
                  className="px-2 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  Code
                </button>
              </div>

              <textarea
                id="note-modal-textarea"
                rows={9}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono leading-relaxed rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
              />
            </div>
          ) : (
            <div
              className="p-4 min-h-[200px] rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-surface-muted-light/40 dark:bg-surface-muted-dark/40 text-xs leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
            />
          )}

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
                {loading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
