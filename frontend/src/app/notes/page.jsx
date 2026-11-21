'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import QuickAddModal from '../../components/QuickAddModal';
import NoteModal from '../../components/NoteModal';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Pin,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';

export default function NotesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [notes, setNotes] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Modals
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getNotes({
        search: search || undefined,
        tag: selectedTag !== 'All' ? selectedTag : undefined,
      });
      if (res.success) {
        setNotes(res.data);
        if (res.availableTags) {
          setAvailableTags(res.availableTags);
        }
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, selectedTag]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Strip markdown tags for clean card excerpt preview
  const getExcerpt = (text) => {
    if (!text) return 'No content';
    return text
      .replace(/###|##|#|\*\*|\*|`|>|-/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const getCardBorder = (color) => {
    switch (color) {
      case 'indigo':
        return 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20';
      case 'emerald':
        return 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20';
      case 'amber':
        return 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20';
      case 'rose':
        return 'border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20';
      default:
        return 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80';
    }
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const regularNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadNotes} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Personal Academic Notes
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Markdown & Tag Organization
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Capture lecture summaries, formula sheets, and lab cheatsheets organized chronologically.
            </p>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95 self-start lg:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Note</span>
          </button>
        </div>

        {/* Search & Tag Filter Pills */}
        <div className="space-y-3">
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search in title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Tags Cloud */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-xs font-medium mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedTag === 'All'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              All Notes ({notes.length})
            </button>
            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedTag === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* PINNED NOTES SECTION */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Pin className="w-3.5 h-3.5 text-indigo-500 fill-current" />
              <span>Pinned Notes ({pinnedNotes.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => {
                    setSelectedNote(note);
                    setNoteModalOpen(true);
                  }}
                  className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between ${getCardBorder(
                    note.color
                  )}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {note.title}
                      </h3>
                      <Pin className="w-3.5 h-3.5 text-indigo-500 fill-current shrink-0" />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed font-sans">
                      {getExcerpt(note.content)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REGULAR NOTES SECTION */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>All Chronological Notes ({regularNotes.length})</span>
          </div>

          {regularNotes.length === 0 && pinnedNotes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <p className="text-xs text-slate-400">No notes found matching your criteria.</p>
              <button
                onClick={() => setQuickAddOpen(true)}
                className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Create a new note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => {
                    setSelectedNote(note);
                    setNoteModalOpen(true);
                  }}
                  className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between ${getCardBorder(
                    note.color
                  )}`}
                >
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {note.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed font-sans">
                      {getExcerpt(note.content)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        initialTab="note"
        onCreated={() => loadNotes()}
      />

      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        note={selectedNote}
        onUpdated={() => loadNotes()}
        onDeleted={() => loadNotes()}
      />
    </div>
  );
}
