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
    if (!confirm('Delete this note?')) return;
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
      .replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold my-2 text-ink-primary-light dark:text-ink-primary-dark">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-base font-bold my-3 text-ink-primary-light dark:text-ink-primary-dark">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-hairline-strong-light dark:border-hairline-strong-dark pl-2.5 py-0.5 my-2 italic text-ink-secondary-light dark:text-ink-secondary-dark">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\`(.*?)\`/gim, '<code class="px-1 py-0.2 rounded bg-surface-subtle-light dark:bg-surface-subtle-dark font-mono text-[11px]">$1</code>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-xs">$1</li>')
      .replace(/\n$/gim, '<br />')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-xl shadow-xl border border-hairline-light dark:border-hairline-dark overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-3.5 border-b border-hairline-light dark:border-hairline-dark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
              className={`p-1 rounded transition ${
                form.isPinned ? 'text-ochre' : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light'
              }`}
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </button>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
              Notebook Inspector
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-subtle-light dark:bg-surface-subtle-dark rounded p-0.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-2 py-0.5 rounded transition ${
                  !isPreview ? 'bg-surface-light dark:bg-surface-dark font-bold text-ink-primary-light dark:text-ink-primary-dark shadow-tactile' : 'text-ink-muted-light'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-2 py-0.5 rounded transition ${
                  isPreview ? 'bg-surface-light dark:bg-surface-dark font-bold text-ink-primary-light dark:text-ink-primary-dark shadow-tactile' : 'text-ink-muted-light'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded bg-vermilion-bg dark:bg-vermilion-bg-dark border border-vermilion/30 text-vermilion dark:text-vermilion-dark text-xs font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-bold rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none"
            />
          </div>

          {!isPreview ? (
            <div>
              <div className="flex items-center gap-1 mb-1 p-1 bg-surface-subtle-light dark:bg-surface-subtle-dark rounded border border-hairline-light dark:border-hairline-dark text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px] italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`')}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-light dark:hover:bg-surface-dark font-mono text-[11px]"
                >
                  Code
                </button>
              </div>

              <textarea
                id="note-modal-textarea"
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono leading-relaxed rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none resize-none"
              />
            </div>
          ) : (
            <div
              className="p-3.5 min-h-[190px] rounded border border-hairline-light dark:border-hairline-dark bg-surface-subtle-light/30 dark:bg-surface-subtle-dark/30 text-xs leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
            />
          )}

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
                {loading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
