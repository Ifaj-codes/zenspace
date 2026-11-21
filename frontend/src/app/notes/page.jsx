'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import QuickAddModal from '../../components/QuickAddModal';
import NoteModal from '../../components/NoteModal';
import {
  Plus,
  Search,
  Pin,
  Tag,
  BookOpen,
} from 'lucide-react';

export default function NotesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [notes, setNotes] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, selectedTag]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadNotes} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle-light dark:border-border-subtle-dark pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-brand dark:text-brand-dark px-2 py-0.5 rounded bg-matcha-100/70 dark:bg-matcha-900/30">
                Knowledge Base
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight">
              Study Notebook
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5">
              Course lecture notes, formula sheets, lab snippets, and project ideas.
            </p>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light shadow-xs transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Search & Tags */}
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted-light dark:text-ink-muted-dark" />
            <input
              type="text"
              placeholder="Search across notes and tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark focus:border-brand dark:focus:border-brand-dark outline-none text-xs placeholder:text-ink-muted-light text-ink-primary-light dark:text-ink-primary-dark shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-3 py-1 rounded-md transition ${
                selectedTag === 'All'
                  ? 'bg-matcha-100 dark:bg-matcha-900/40 font-semibold text-brand dark:text-brand-dark shadow-xs'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light hover:bg-surface-muted-light/60'
              }`}
            >
              All Notes ({notes.length})
            </button>
            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-md transition font-mono ${
                  selectedTag === t
                    ? 'bg-matcha-100 dark:bg-matcha-900/40 font-semibold text-brand dark:text-brand-dark shadow-xs'
                    : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light hover:bg-surface-muted-light/60'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Note Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark bg-surface-muted-light/40 dark:bg-surface-muted-dark/40 rounded-xl border border-border-subtle-light dark:border-border-subtle-dark">
              <p className="font-serif italic text-base text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                No notes found.
              </p>
              Capture formulas, lecture notes, or code cheat-sheets to keep them organized.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                onClick={() => {
                  setSelectedNote(note);
                  setNoteModalOpen(true);
                }}
                className="p-4 rounded-xl border border-border-subtle-light dark:border-border-subtle-dark bg-surface-light dark:bg-surface-dark hover:border-matcha-300 dark:hover:border-matcha-700/60 transition cursor-pointer group flex flex-col justify-between min-h-[160px] shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <h3 className="text-xs font-semibold text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand dark:group-hover:text-brand-dark transition line-clamp-1">
                      {note.title}
                    </h3>
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />}
                  </div>
                  <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-4 leading-relaxed font-sans">
                    {note.content.replace(/[#*`>-]/g, '').trim()}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-matcha-50 dark:bg-matcha-900/30 text-brand dark:text-brand-dark font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono">
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
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
