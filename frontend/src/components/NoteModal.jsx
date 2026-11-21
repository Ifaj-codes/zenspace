'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Tag,
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
    const previousText = textarea.value;
    const selected = previousText.substring(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    const nextContent = previousText.substring(0, start) + replacement + previousText.substring(end);
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

  // Simple, elegant Markdown renderer for the preview
  const renderMarkdown = (text) => {
    if (!text) return '<p class="text-slate-400 italic">No note content provided yet.</p>';
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold my-2 text-indigo-600 dark:text-indigo-400">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold my-2 text-slate-900 dark:text-white">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold my-3 text-slate-900 dark:text-white">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-3 py-1 my-2 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Inline code
      .replace(/\`(.*?)\`/gim, '<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400">$1</code>')
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      // Line breaks
      .replace(/\n$/gim, '<br />')
      .replace(/\n/gim, '<br />');

    return html;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
              className={`p-1.5 rounded-lg transition ${
                form.isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={form.isPinned ? 'Pinned Note' : 'Pin Note'}
            >
              <Pin className="w-4 h-4 fill-current" />
            </button>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edit Academic Note</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Markdown Toolbar / Preview Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-2">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`p-1 rounded text-xs flex items-center gap-1 font-medium transition ${
                  !isPreview ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`p-1 rounded text-xs flex items-center gap-1 font-medium transition ${
                  isPreview ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-base font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="CSE324, WebTech, Architecture"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {!isPreview ? (
            <div>
              {/* Quick Markdown Formatting Helper Bar */}
              <div className="flex items-center gap-1 mb-1.5 p-1 bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Heading"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Bullet list"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Code snippet"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                id="note-modal-textarea"
                rows={9}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono leading-relaxed rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          ) : (
            <div
              className="p-4 min-h-[220px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-sm leading-relaxed prose dark:prose-invert max-w-none overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Card Theme:</span>
              {['default', 'indigo', 'emerald', 'amber', 'rose'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-5 h-5 rounded-full border transition ${
                    form.color === c ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-70'
                  } ${
                    c === 'indigo'
                      ? 'bg-indigo-400 border-indigo-500'
                      : c === 'emerald'
                      ? 'bg-emerald-400 border-emerald-500'
                      : c === 'amber'
                      ? 'bg-amber-400 border-amber-500'
                      : c === 'rose'
                      ? 'bg-rose-400 border-rose-500'
                      : 'bg-slate-300 border-slate-400'
                  }`}
                />
              ))}
            </div>

            <span className="text-[11px] text-slate-400">
              Updated: {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Note
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
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
