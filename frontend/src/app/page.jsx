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
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Pin,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  MapPin,
  AlertCircle,
  Hash,
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

  // Filters & State
  const [taskFilter, setTaskFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState('High');

  // Modals
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState('task');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Mini-calendar month navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [overviewRes, tasksRes, eventsRes, notesRes] = await Promise.all([
        api.getDashboardOverview(),
        api.getTasks(),
        api.getEvents(),
        api.getNotes(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (notesRes.success) setNotes(notesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // One-click task toggle
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
      console.error('Failed to toggle task:', err);
    }
  };

  // Inline quick task submission
  const handleInlineQuickTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    try {
      const res = await api.createTask({
        title: quickTaskTitle.trim(),
        priority: quickTaskPriority,
        dueDate: selectedDate,
        courseCode: 'CSE 324',
      });
      if (res.success) {
        setTasks((prev) => [res.data, ...prev]);
        setQuickTaskTitle('');
        api.getDashboardOverview().then((o) => {
          if (o.success) setOverview(o.data);
        });
      }
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  // Mini-calendar generation logic
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

  const formatDateISO = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${year}-${pad(month + 1)}-${pad(d)}`;
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'All') return true;
    if (taskFilter === 'Pending') return t.status === 'pending';
    if (taskFilter === 'Completed') return t.status === 'completed';
    return t.priority === taskFilter;
  });

  const selectedDateEvents = events.filter((e) => e.date === selectedDate);
  const selectedDateTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const todayStr = new Date().toISOString().split('T')[0];

  // Urgent pending high-priority task for top attention strip
  const urgentTask = tasks.find((t) => t.priority === 'High' && t.status !== 'completed');

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-light dark:bg-canvas-dark">
        <div className="font-mono text-xs text-ink-muted-light dark:text-ink-muted-dark tracking-widest uppercase">
          Initializing ZenSpace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-col transition-colors">
      <Navbar
        onOpenQuickAdd={() => {
          setQuickAddInitialTab('task');
          setQuickAddOpen(true);
        }}
        onDataRefresh={loadDashboardData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Architectural Academic Horizon Banner (Replaces Generic 4 Cards) */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-hairline-light dark:border-hairline-dark p-5 shadow-tactile space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-hairline-light dark:border-hairline-dark">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
                  Academic Workstation // {user?.name || 'Nesar Uddin Ifag'}
                </h1>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-subtle-light dark:bg-surface-subtle-dark border border-hairline-light dark:border-hairline-dark text-ink-secondary-light dark:text-ink-secondary-dark">
                  ID: {user?.studentId || '1119004'}
                </span>
              </div>
              <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                • Single-dashboard schedule planning, priority execution & notes.
              </p>
            </div>

            {/* Precision Telemetry Gauge */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-ink-muted-light dark:text-ink-muted-dark text-[10px] uppercase block tracking-wider">
                  Completion
                </span>
                <span className="font-bold text-ink-primary-light dark:text-ink-primary-dark">
                  {overview?.summary?.completedTasks || 0} / {overview?.summary?.totalTasks || 0} DONE ({overview?.summary?.completionRate || 0}%)
                </span>
              </div>
              <div className="w-24 h-1.5 bg-surface-subtle-light dark:bg-surface-subtle-dark border border-hairline-light dark:border-hairline-dark rounded-sm overflow-hidden">
                <div
                  className="bg-ink-primary-light dark:bg-ink-primary-dark h-full transition-all duration-300"
                  style={{ width: `${overview?.summary?.completionRate || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Urgent Attention Alert Strip (If Any Hard Deadline Pending) */}
          {urgentTask && (
            <div className="p-2.5 rounded-lg bg-vermilion-bg dark:bg-vermilion-bg-dark border border-vermilion/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-vermilion dark:text-vermilion-dark font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>CRITICAL DEADLINE:</strong> {urgentTask.title} (Target: {urgentTask.dueDate} // {urgentTask.courseCode})
                </span>
              </div>
              <button
                onClick={(e) => handleToggleTask(urgentTask._id, e)}
                className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded bg-vermilion text-white hover:opacity-90 transition active:scale-95"
              >
                Mark Completed
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Split Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 5 COLUMNS: Monthly Grid & Date Agenda */}
          <div className="lg:col-span-5 space-y-6">
            {/* Precision Calendar Grid Widget */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-hairline-light dark:border-hairline-dark p-4 shadow-tactile space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-cobalt" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
                    {monthNames[month]} {year}
                  </h3>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCalendarDate(new Date());
                      setSelectedDate(todayStr);
                    }}
                    className="px-2 py-0.5 text-[10px] font-semibold rounded bg-surface-subtle-light dark:bg-surface-subtle-dark border border-hairline-light dark:border-hairline-dark"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark border-b border-hairline-light dark:border-hairline-dark pb-1.5">
                <span>SU</span>
                <span>MO</span>
                <span>TU</span>
                <span>WE</span>
                <span>TH</span>
                <span>FR</span>
                <span>SA</span>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const iso = formatDateISO(dayNum);
                  const isToday = iso === todayStr;
                  const isSelected = iso === selectedDate;

                  const dayEvents = events.filter((e) => e.date === iso);
                  const dayTasks = tasks.filter((t) => t.dueDate === iso);
                  const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
                  const hasCritical = dayTasks.some((t) => t.priority === 'High' && t.status !== 'completed');

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDate(iso)}
                      className={`h-8 rounded relative flex flex-col items-center justify-center font-mono text-xs transition ${
                        isSelected
                          ? 'bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark font-bold'
                          : isToday
                          ? 'border border-cobalt text-cobalt font-bold'
                          : 'hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark text-ink-primary-light dark:text-ink-primary-dark'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {hasItems && (
                        <div className="absolute bottom-1 flex items-center gap-0.5">
                          {hasCritical ? (
                            <span className="w-1 h-1 rounded-full bg-vermilion" />
                          ) : (
                            <span
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-canvas-light dark:bg-canvas-dark' : 'bg-cobalt'
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-hairline-light dark:border-hairline-dark flex items-center justify-between font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt" />
                  <span>Class/Lab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
                  <span>Task Deadline</span>
                </div>
                <Link href="/calendar" className="text-ink-primary-light dark:text-ink-primary-dark font-semibold hover:underline">
                  Full View →
                </Link>
              </div>
            </div>

            {/* Daily Agenda for Selected Date */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-hairline-light dark:border-hairline-dark p-4 shadow-tactile space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-hairline-light dark:border-hairline-dark">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-ink-secondary-light dark:text-ink-secondary-dark" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
                    Agenda: {selectedDate === todayStr ? 'Today, ' : ''}
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setQuickAddInitialTab('event');
                    setQuickAddOpen(true);
                  }}
                  className="text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Event
                </button>
              </div>

              {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-ink-muted-light dark:text-ink-muted-dark font-mono">
                  No classes or deadlines scheduled on this date.
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Academic Events */}
                  {selectedDateEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setEventModalOpen(true);
                      }}
                      className="p-2.5 rounded border border-hairline-light dark:border-hairline-dark hover:border-border-strong bg-surface-subtle-light/40 dark:bg-surface-subtle-dark/40 hover:bg-surface-light dark:hover:bg-surface-dark transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                          {evt.startTime}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-xs text-ink-primary-light dark:text-ink-primary-dark group-hover:underline">
                              {evt.title}
                            </span>
                            <span className="font-mono text-[9px] px-1 py-0.2 rounded border border-hairline-light dark:border-hairline-dark text-ink-secondary-light dark:text-ink-secondary-dark">
                              {evt.category}
                            </span>
                          </div>
                          {evt.location && (
                            <span className="text-[10px] text-ink-muted-light dark:text-ink-muted-dark block mt-0.5">
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                        {evt.endTime}
                      </span>
                    </div>
                  ))}

                  {/* Task Deadlines Synced to Calendar */}
                  {selectedDateTasks.map((tsk) => (
                    <div
                      key={tsk._id}
                      onClick={() => {
                        setSelectedTask(tsk);
                        setTaskModalOpen(true);
                      }}
                      className="p-2.5 rounded border border-vermilion/30 bg-vermilion-bg/60 dark:bg-vermilion-bg-dark/40 hover:border-vermilion transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={(e) => handleToggleTask(tsk._id, e)}
                          className="w-4 h-4 rounded-sm border border-hairline-strong-light dark:border-hairline-strong-dark flex items-center justify-center hover:border-vermilion transition"
                        >
                          {tsk.status === 'completed' && <Check className="w-3 h-3 text-pine" />}
                        </button>
                        <div>
                          <span
                            className={`text-xs font-medium ${
                              tsk.status === 'completed'
                                ? 'line-through text-ink-muted-light dark:text-ink-muted-dark'
                                : 'text-ink-primary-light dark:text-ink-primary-dark'
                            }`}
                          >
                            {tsk.title}
                          </span>
                          <div className="font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark flex items-center gap-1 mt-0.5">
                            <span>[DEADLINE]</span>
                            <span>•</span>
                            <span>{tsk.courseCode || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-vermilion dark:text-vermilion-dark">
                        [{tsk.priority.toUpperCase()}]
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 7 COLUMNS: Prioritized Academic Task Backlog */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-hairline-light dark:border-hairline-dark p-5 shadow-tactile space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline-light dark:border-hairline-dark">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-ink-primary-light dark:text-ink-primary-dark" />
                  <h2 className="font-bold text-xs uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
                    Task Backlog // Execution Board
                  </h2>
                </div>

                {/* Filter Segment Tabs */}
                <div className="flex items-center gap-1 font-mono text-[11px] overflow-x-auto">
                  {['All', 'High', 'Medium', 'Low', 'Pending', 'Completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTaskFilter(tab)}
                      className={`px-2 py-0.5 rounded transition ${
                        taskFilter === tab
                          ? 'bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark font-semibold'
                          : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Inline Task Capture */}
              <form onSubmit={handleInlineQuickTask} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Add task to backlog (press Enter to commit)..."
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-ink-primary-light dark:focus:border-ink-primary-dark outline-none transition font-sans"
                />
                <select
                  value={quickTaskPriority}
                  onChange={(e) => setQuickTaskPriority(e.target.value)}
                  className="px-2 py-1.5 text-xs font-mono rounded border border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark text-ink-secondary-light dark:text-ink-secondary-dark outline-none"
                >
                  <option value="High">HIGH</option>
                  <option value="Medium">MED</option>
                  <option value="Low">LOW</option>
                </select>
                <button
                  type="submit"
                  disabled={!quickTaskTitle.trim()}
                  className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-ink-primary-light text-canvas-light dark:bg-ink-primary-dark dark:text-canvas-dark hover:opacity-90 disabled:opacity-40 transition"
                >
                  Add
                </button>
              </form>

              {/* Task Items Dense List */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <p className="text-center py-8 text-xs font-mono text-ink-muted-light dark:text-ink-muted-dark">
                    No items found matching filter "{taskFilter}".
                  </p>
                ) : (
                  filteredTasks.map((t) => {
                    const isDone = t.status === 'completed';
                    return (
                      <div
                        key={t._id}
                        onClick={() => {
                          setSelectedTask(t);
                          setTaskModalOpen(true);
                        }}
                        className="p-2.5 rounded border border-hairline-light dark:border-hairline-dark hover:border-hairline-strong-light dark:hover:border-hairline-strong-dark bg-surface-light dark:bg-surface-dark hover:bg-surface-subtle-light/40 dark:hover:bg-surface-subtle-dark/40 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                          <button
                            onClick={(e) => handleToggleTask(t._id, e)}
                            className="w-4 h-4 rounded-sm border border-hairline-strong-light dark:border-hairline-strong-dark flex items-center justify-center hover:border-ink-primary-light transition shrink-0"
                          >
                            {isDone && <Check className="w-3 h-3 text-pine" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-medium truncate ${
                                isDone
                                  ? 'line-through text-ink-muted-light dark:text-ink-muted-dark'
                                  : 'text-ink-primary-light dark:text-ink-primary-dark'
                              }`}
                            >
                              {t.title}
                            </p>
                            <div className="font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark flex items-center gap-2 mt-0.5">
                              <span>Due: {t.dueDate}</span>
                              <span>•</span>
                              <span>{t.courseCode || 'General'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded border font-semibold ${
                              t.priority === 'High'
                                ? 'text-vermilion border-vermilion/40 bg-vermilion-bg dark:bg-vermilion-bg-dark'
                                : t.priority === 'Medium'
                                ? 'text-ochre border-ochre/40 bg-ochre-bg dark:bg-ochre-bg-dark'
                                : 'text-pine border-pine/40 bg-pine-bg dark:bg-pine-bg-dark'
                            }`}
                          >
                            {t.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Notes & Notebook Index */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-hairline-light dark:border-hairline-dark p-5 shadow-tactile space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline-light dark:border-hairline-dark">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-primary-light dark:text-ink-primary-dark" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-ink-primary-light dark:text-ink-primary-dark">
                Notebook // Study Cheatsheets ({notes.length})
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setQuickAddInitialTab('note');
                  setQuickAddOpen(true);
                }}
                className="text-xs font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>
              <Link
                href="/notes"
                className="text-xs font-mono font-medium text-ink-primary-light dark:text-ink-primary-dark hover:underline flex items-center gap-1"
              >
                <span>All Notes</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                onClick={() => {
                  setSelectedNote(note);
                  setNoteModalOpen(true);
                }}
                className="p-4 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light/60 dark:bg-canvas-dark/60 hover:border-hairline-strong-light dark:hover:border-hairline-strong-dark transition cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-ink-primary-light dark:text-ink-primary-dark group-hover:underline">
                      {note.title}
                    </h4>
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-ochre fill-current shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-ink-secondary-light dark:text-ink-secondary-dark line-clamp-3 leading-relaxed mt-1 font-sans">
                    {note.content.replace(/[#*`>-]/g, '').trim()}
                  </p>
                </div>

                <div className="pt-2 border-t border-hairline-light dark:border-hairline-dark flex items-center justify-between font-mono text-[10px]">
                  <div className="flex flex-wrap gap-1">
                    {note.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-ink-muted-light dark:text-ink-muted-dark">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-ink-muted-light dark:text-ink-muted-dark">
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </span>
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
        onCreated={() => loadDashboardData()}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onUpdated={() => loadDashboardData()}
        onDeleted={() => loadDashboardData()}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={selectedEvent}
        onUpdated={() => loadDashboardData()}
        onDeleted={() => loadDashboardData()}
      />

      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        note={selectedNote}
        onUpdated={() => loadDashboardData()}
        onDeleted={() => loadDashboardData()}
      />
    </div>
  );
}
