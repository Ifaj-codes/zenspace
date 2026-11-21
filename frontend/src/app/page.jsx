'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import QuickAddModal from '../components/QuickAddModal';
import TaskModal from '../components/TaskModal';
import EventModal from '../components/EventModal';
import NoteModal from '../components/NoteModal';
import {
  Check,
  Plus,
  ArrowRight,
  Pin,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick task input
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modals
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState('task');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [oRes, tRes, eRes, nRes] = await Promise.all([
        api.getDashboardOverview(),
        api.getTasks(),
        api.getEvents(),
        api.getNotes(),
      ]);
      if (oRes.success) setOverview(oRes.data);
      if (tRes.success) setTasks(tRes.data);
      if (eRes.success) setEvents(eRes.data);
      if (nRes.success) setNotes(nRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTask = async (taskId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleTask(taskId);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: res.data.status } : t))
        );
        api.getDashboardOverview().then((o) => {
          if (o.success) setOverview(o.data);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuickTask = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      const todayISO = new Date().toISOString().split('T')[0];
      const res = await api.createTask({
        title: quickTitle.trim(),
        priority: quickPriority,
        dueDate: todayISO,
        courseCode: 'CSE 324',
      });
      if (res.success) {
        setTasks((prev) => [res.data, ...prev]);
        setQuickTitle('');
        api.getDashboardOverview().then((o) => {
          if (o.success) setOverview(o.data);
        });
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-light dark:bg-canvas-dark">
        <p className="text-xs font-serif italic text-ink-muted-light dark:text-ink-muted-dark">
          ZenSpace
        </p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks naturally
  const pendingTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (filterPriority !== 'All') return t.priority === filterPriority;
    return true;
  });

  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Filter events: today and upcoming this week
  const todayEvents = events.filter((e) => e.date === todayStr);
  const upcomingEvents = events.filter((e) => e.date > todayStr).slice(0, 4);

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-col transition-colors">
      <Navbar
        onOpenQuickAdd={() => {
          setQuickAddInitialTab('task');
          setQuickAddOpen(true);
        }}
        onDataRefresh={loadData}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Calm Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-subtle-light dark:border-border-subtle-dark pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-1">
              Welcome, {user?.name || 'Ifag'} • {pendingTasks.length} pending tasks • {todayEvents.length} class scheduled today
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted-light dark:text-ink-muted-dark font-mono">
              BAIUST CSE
            </span>
          </div>
        </div>

        {/* 2-Column Focus Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Schedule & Calendar Integration (5 cols) */}
          <div className="md:col-span-5 space-y-8">
            {/* Today's Schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark">
                  Today's Schedule
                </h2>
                <Link
                  href="/calendar"
                  className="text-xs text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition"
                >
                  Calendar →
                </Link>
              </div>

              {todayEvents.length === 0 ? (
                <div className="py-6 px-4 rounded-lg bg-surface-muted-light dark:bg-surface-muted-dark border border-border-subtle-light dark:border-border-subtle-dark text-xs text-ink-muted-light dark:text-ink-muted-dark text-center">
                  No classes or events scheduled for today.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setEventModalOpen(true);
                      }}
                      className="p-3.5 rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-surface-light dark:bg-surface-dark hover:border-border-strong-light dark:hover:border-border-strong-dark transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-ink-secondary-light dark:text-ink-secondary-dark font-mono mb-1">
                        <span>{evt.startTime} – {evt.endTime}</span>
                        <span className="capitalize">{evt.category}</span>
                      </div>
                      <h3 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
                        {evt.title}
                      </h3>
                      {evt.location && (
                        <p className="text-xs text-ink-muted-light dark:text-ink-muted-dark mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {evt.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming This Week */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark mb-3">
                  Upcoming Events
                </h2>
                <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark">
                  {upcomingEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setEventModalOpen(true);
                      }}
                      className="py-2.5 flex items-baseline justify-between cursor-pointer group"
                    >
                      <div className="pr-3">
                        <p className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:underline">
                          {evt.title}
                        </p>
                        <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
                          {evt.location || evt.category}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-ink-muted-light dark:text-ink-muted-dark shrink-0">
                        {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Tasks (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* Task Controls & Filter */}
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle-light dark:border-border-subtle-dark">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark">
                Tasks ({pendingTasks.length})
              </h2>

              <div className="flex items-center gap-1 text-xs">
                {['All', 'High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2 py-0.5 rounded transition ${
                      filterPriority === p
                        ? 'bg-surface-muted-light dark:bg-surface-muted-dark text-ink-primary-light dark:text-ink-primary-dark font-medium'
                        : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Quick Add */}
            <form onSubmit={handleCreateQuickTask} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a new task... (press Enter)"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-md bg-surface-muted-light dark:bg-surface-muted-dark border border-transparent focus:border-border-strong-light dark:focus:border-border-strong-dark outline-none transition text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark"
              />
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-md bg-surface-muted-light dark:bg-surface-muted-dark border border-transparent outline-none text-ink-secondary-light dark:text-ink-secondary-dark"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                type="submit"
                disabled={!quickTitle.trim()}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 disabled:opacity-30 transition"
              >
                Add
              </button>
            </form>

            {/* Pending Task List */}
            <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark">
              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark">
                  All tasks completed for now. Enjoy the focus.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskModalOpen(true);
                    }}
                    className="py-3 flex items-start justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={(e) => handleToggleTask(task._id, e)}
                        className="mt-0.5 w-4 h-4 rounded-full border border-border-strong-light dark:border-border-strong-dark flex items-center justify-center hover:border-ink-primary-light dark:hover:border-ink-primary-dark transition shrink-0"
                      >
                        {task.status === 'completed' && <Check className="w-2.5 h-2.5 text-brand" />}
                      </button>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand transition">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
                          <span>Due {task.dueDate}</span>
                          <span>•</span>
                          <span>{task.courseCode || 'General'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          task.priority === 'High'
                            ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                            : task.priority === 'Medium'
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Completed section */}
            {completedTasks.length > 0 && (
              <div className="pt-4 border-t border-border-subtle-light dark:border-border-subtle-dark">
                <span className="text-xs text-ink-muted-light dark:text-ink-muted-dark block mb-2">
                  Completed ({completedTasks.length})
                </span>
                <div className="space-y-1.5">
                  {completedTasks.slice(0, 3).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => {
                        setSelectedTask(task);
                        setTaskModalOpen(true);
                      }}
                      className="flex items-center justify-between text-xs text-ink-muted-light dark:text-ink-muted-dark py-1 cursor-pointer line-through"
                    >
                      <span className="truncate">{task.title}</span>
                      <span className="text-[10px] shrink-0 font-mono">{task.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notebook Preview Row */}
        <div className="border-t border-border-subtle-light dark:border-border-subtle-dark pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark">
              Study Notebook
            </h2>
            <Link
              href="/notes"
              className="text-xs text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark transition"
            >
              All Notes ({notes.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note._id}
                onClick={() => {
                  setSelectedNote(note);
                  setNoteModalOpen(true);
                }}
                className="p-4 rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-surface-light dark:bg-surface-dark hover:border-border-strong-light dark:hover:border-border-strong-dark transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:underline line-clamp-1">
                      {note.title}
                    </h3>
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                  </div>
                  <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-3 leading-relaxed">
                    {note.content.replace(/[#*`>-]/g, '').trim()}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                  <span>{note.tags?.[0] ? `#${note.tags[0]}` : 'Note'}</span>
                  <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        initialTab={quickAddInitialTab}
        onCreated={() => loadData()}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onUpdated={() => loadData()}
        onDeleted={() => loadData()}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={selectedEvent}
        onUpdated={() => loadData()}
        onDeleted={() => loadData()}
      />

      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        note={selectedNote}
        onUpdated={() => loadData()}
        onDeleted={() => loadData()}
      />
    </div>
  );
}
