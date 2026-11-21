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
  BookOpen,
  CheckCircle2,
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

  // Time ticker state
  const [currentTime, setCurrentTime] = useState('');

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

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex items-center gap-2 text-brand dark:text-brand-dark">
          <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
          <p className="text-sm font-serif italic text-ink-secondary-light dark:text-ink-secondary-dark">
            Entering ZenSpace...
          </p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks
  const pendingTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (filterPriority !== 'All') return t.priority === filterPriority;
    return true;
  });

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const totalTasks = tasks.length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

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
        {/* Subtle Zen Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle-light dark:border-border-subtle-dark pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-matcha-100/80 dark:bg-matcha-900/40 text-brand dark:text-brand-dark border border-matcha-200/60 dark:border-matcha-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {currentTime || '10:00 AM'} · Cumilla, BD
              </span>
              <span className="text-xs text-ink-muted-light dark:text-ink-muted-dark font-mono">
                BAIUST CSE 324
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary-light dark:text-ink-secondary-dark mt-1">
              Welcome back, {user?.name || 'Ifag'}. You have {pendingTasks.length} tasks needing attention today.
            </p>
          </div>

          {/* Quiet Progress Bar */}
          <div className="sm:text-right shrink-0">
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs mb-1.5">
              <span className="text-ink-muted-light dark:text-ink-muted-dark">Focus Completion</span>
              <span className="font-mono font-medium text-brand dark:text-brand-dark">
                {completedTasks.length}/{totalTasks} ({completionPercent}%)
              </span>
            </div>
            <div className="w-full sm:w-44 h-1.5 bg-surface-muted-light dark:bg-surface-muted-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-brand dark:bg-brand-dark rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Focus Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT COLUMN: Schedule & Calendar Timetable (5 cols) */}
          <div className="md:col-span-5 space-y-7">
            {/* Today's Schedule */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-brand dark:text-brand-dark" />
                  Today's Schedule
                </h2>
                <Link
                  href="/calendar"
                  className="text-xs font-medium text-brand dark:text-brand-dark hover:underline transition"
                >
                  Full Timetable →
                </Link>
              </div>

              {todayEvents.length === 0 ? (
                <div className="py-7 px-4 rounded-xl bg-surface-muted-light/60 dark:bg-surface-muted-dark/60 border border-border-subtle-light dark:border-border-subtle-dark text-xs text-ink-muted-light dark:text-ink-muted-dark text-center">
                  <p className="font-serif italic text-sm mb-1 text-ink-secondary-light dark:text-ink-secondary-dark">Quiet Day</p>
                  No scheduled classes or laboratory sessions for today.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setEventModalOpen(true);
                      }}
                      className="p-3.5 rounded-xl border border-border-subtle-light dark:border-border-subtle-dark bg-surface-light dark:bg-surface-dark hover:border-matcha-300 dark:hover:border-matcha-700/60 transition cursor-pointer shadow-xs border-l-4 border-l-brand dark:border-l-brand-dark group"
                    >
                      <div className="flex items-center justify-between text-xs text-ink-muted-light dark:text-ink-muted-dark font-mono mb-1">
                        <span className="flex items-center gap-1 text-ink-secondary-light dark:text-ink-secondary-dark font-medium">
                          <Clock className="w-3 h-3 text-brand dark:text-brand-dark" />
                          {evt.startTime} – {evt.endTime}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-matcha-50 dark:bg-matcha-900/30 text-brand dark:text-brand-dark">
                          {evt.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand dark:group-hover:text-brand-dark transition">
                        {evt.title}
                      </h3>
                      {evt.location && (
                        <p className="text-xs text-ink-muted-light dark:text-ink-muted-dark mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-matcha-600 dark:text-matcha-400" />
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
                  Upcoming This Week
                </h2>
                <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark border-t border-border-subtle-light dark:border-border-subtle-dark">
                  {upcomingEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setEventModalOpen(true);
                      }}
                      className="py-3 flex items-baseline justify-between cursor-pointer group hover:bg-surface-muted-light/40 dark:hover:bg-surface-muted-dark/40 px-2 rounded-md transition"
                    >
                      <div className="pr-3">
                        <p className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand dark:group-hover:text-brand-dark transition">
                          {evt.title}
                        </p>
                        <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark mt-0.5">
                          {evt.location || evt.category}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-muted-light dark:bg-surface-muted-dark text-ink-secondary-light dark:text-ink-secondary-dark shrink-0">
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
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle-light dark:border-border-subtle-dark">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand dark:text-brand-dark" />
                Focus Tasks ({pendingTasks.length})
              </h2>

              <div className="flex items-center gap-1 text-xs">
                {['All', 'High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2.5 py-0.5 rounded-md transition text-xs ${
                      filterPriority === p
                        ? 'bg-matcha-100 dark:bg-matcha-900/40 text-brand dark:text-brand-dark font-medium shadow-xs'
                        : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Quick Add Bar */}
            <form onSubmit={handleCreateQuickTask} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Capture a task... (press Enter to save)"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark focus:border-brand dark:focus:border-brand-dark outline-none transition text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark shadow-xs"
              />
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark outline-none text-ink-secondary-light dark:text-ink-secondary-dark shadow-xs"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                type="submit"
                disabled={!quickTitle.trim()}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light hover:opacity-90 disabled:opacity-30 transition shadow-xs"
              >
                Add
              </button>
            </form>

            {/* Pending Task List */}
            <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark">
              {pendingTasks.length === 0 ? (
                <div className="py-10 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark rounded-xl bg-surface-muted-light/40 dark:bg-surface-muted-dark/40 border border-border-subtle-light dark:border-border-subtle-dark">
                  <p className="font-serif italic text-base text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                    Everything complete.
                  </p>
                  No tasks pending under current filter. Enjoy the calm.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskModalOpen(true);
                    }}
                    className="py-3.5 px-2 -mx-2 rounded-lg flex items-start justify-between gap-3 group cursor-pointer hover:bg-surface-muted-light/40 dark:hover:bg-surface-muted-dark/40 transition"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Tactile round toggle button */}
                      <button
                        onClick={(e) => handleToggleTask(task._id, e)}
                        title="Mark complete"
                        className="mt-0.5 w-4 h-4 rounded-full border border-matcha-400 dark:border-matcha-600 flex items-center justify-center hover:bg-matcha-100 dark:hover:bg-matcha-900/50 hover:border-brand transition shrink-0 group-hover:scale-105"
                      >
                        {task.status === 'completed' && <Check className="w-2.5 h-2.5 text-brand dark:text-brand-dark" />}
                      </button>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand dark:group-hover:text-brand-dark transition">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark line-clamp-1 mt-0.5 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
                          <span className="font-mono text-ink-secondary-light dark:text-ink-secondary-dark">
                            Due {task.dueDate}
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-muted-light dark:bg-surface-muted-dark text-[10px] font-mono">
                            {task.courseCode || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          task.priority === 'High'
                            ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40'
                            : task.priority === 'Medium'
                            ? 'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40'
                            : 'text-matcha-800 bg-matcha-50 dark:bg-matcha-900/30 dark:text-matcha-300 border border-matcha-200/60 dark:border-matcha-800/40'
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
                <span className="text-xs text-ink-muted-light dark:text-ink-muted-dark block mb-2 font-mono">
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
                      className="flex items-center justify-between text-xs text-ink-muted-light dark:text-ink-muted-dark py-1 cursor-pointer line-through hover:opacity-75"
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand dark:text-brand-dark" />
              Academic Notebook
            </h2>
            <Link
              href="/notes"
              className="text-xs font-medium text-brand dark:text-brand-dark hover:underline transition"
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
                className="p-4 rounded-xl border border-border-subtle-light dark:border-border-subtle-dark bg-surface-light dark:bg-surface-dark hover:border-matcha-300 dark:hover:border-matcha-700/60 transition cursor-pointer group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h3 className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand dark:group-hover:text-brand-dark line-clamp-1 transition">
                      {note.title}
                    </h3>
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                  </div>
                  <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-3 leading-relaxed">
                    {note.content.replace(/[#*`>-]/g, '').trim()}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                  <span className="px-1.5 py-0.5 rounded bg-matcha-50 dark:bg-matcha-900/30 text-brand dark:text-brand-dark font-mono">
                    {note.tags?.[0] ? `#${note.tags[0]}` : '#general'}
                  </span>
                  <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Academic Attribution Footer */}
        <footer className="pt-8 pb-12 border-t border-border-subtle-light dark:border-border-subtle-dark text-center text-xs text-ink-muted-light dark:text-ink-muted-dark space-y-1">
          <p className="font-serif italic">
            ZenSpace — Unified Minimalist Productivity Platform
          </p>
          <p className="font-mono text-[11px]">
            CSE 324 Web Technologies Sessional · BAIUST, Cumilla · Student: Nesar Uddin Ifag (1119004) · Instructor: Yeakob Ali
          </p>
        </footer>
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
