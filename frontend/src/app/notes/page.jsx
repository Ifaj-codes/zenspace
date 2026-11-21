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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle-light dark:border-border-subtle-dark pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight">
              Study Notes
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5">
              Formulas, course summaries, and lab cheatsheets.
            </p>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 self-start sm:self-auto"
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
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-muted-light dark:bg-surface-muted-dark border border-transparent focus:border-border-strong-light outline-none text-xs placeholder:text-ink-muted-light"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedTag === 'All'
                  ? 'bg-surface-muted-light dark:bg-surface-muted-dark font-medium text-ink-primary-light dark:text-ink-primary-dark'
                  : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light'
              }`}
            >
              All ({notes.length})
            </button>
            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2.5 py-1 rounded-md transition ${
                  selectedTag === t
                    ? 'bg-surface-muted-light dark:bg-surface-muted-dark font-medium text-ink-primary-light dark:text-ink-primary-dark'
                    : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Note Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.length === 0 ? (
            <p className="py-12 col-span-2 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark">
              No notes found.
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                onClick={() => {
                  setSelectedNote(note);
                  setNoteModalOpen(true);
                }}
                className="p-4 rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-surface-light dark:bg-surface-dark hover:border-border-strong-light dark:hover:border-border-strong-dark transition cursor-pointer group flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:underline">
                      {note.title}
                    </h3>
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                  </div>
                  <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-3 leading-relaxed">
                    {note.content.replace(/[#*`>-]/g, '').trim()}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                  <div className="flex items-center gap-1.5">
                    {note.tags?.slice(0, 2).map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                  <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
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
