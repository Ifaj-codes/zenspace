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
  AlertTriangle,
  ArrowRight,
  Plus,
  Search,
  Pin,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Circle,
  Sparkles,
  MapPin,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // State management
  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & UI state
  const [taskFilter, setTaskFilter] = useState('All'); // All | High | Medium | Low | pending | completed
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState('High');

  // Modals state
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

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch all dashboard data
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

  // One-click task status toggle
  const handleToggleTask = async (taskId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleTask(taskId);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: res.data.status } : t))
        );
        // Refresh overview metrics quietly
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

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  // Format date helper
  const formatDateISO = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${year}-${pad(month + 1)}-${pad(d)}`;
  };

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'All') return true;
    if (taskFilter === 'Pending') return t.status === 'pending';
    if (taskFilter === 'Completed') return t.status === 'completed';
    return t.priority === taskFilter;
  });

  // Calculate items for selected date in schedule agenda
  const selectedDateEvents = events.filter((e) => e.date === selectedDate);
  const selectedDateTasks = tasks.filter((t) => t.dueDate === selectedDate);

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading ZenSpace...</p>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar
        onOpenQuickAdd={() => {
          setQuickAddInitialTab('task');
          setQuickAddOpen(true);
        }}
        onDataRefresh={loadDashboardData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome & Student Overview Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back, {user?.name || 'Nesar Uddin Ifag'}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                CSE 324 Term Project
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              • Unified academic planning, synchronized calendar & prioritized tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuickAddInitialTab('task');
                setQuickAddOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => {
                setQuickAddInitialTab('event');
                setQuickAddOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
            <button
              onClick={() => {
                setQuickAddInitialTab('note');
                setQuickAddOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* 4 Academic KPI Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tasks Progress */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Task Completion</span>
              <CheckSquare className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {overview?.summary?.completionRate || 0}%
              </span>
              <span className="text-xs text-slate-500">
                ({overview?.summary?.completedTasks || 0}/{overview?.summary?.totalTasks || 0} done)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${overview?.summary?.completionRate || 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: High Priority Deadlines */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">High Priority</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {overview?.summary?.highPriorityPending || 0}
              </span>
              <span className="text-xs text-slate-500">urgent deadlines</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Synced directly with calendar
            </p>
          </div>

          {/* Card 3: Today's Classes & Labs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Today's Schedule</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {overview?.summary?.todayEventsCount || 0}
              </span>
              <span className="text-xs text-slate-500">events scheduled</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
              {overview?.todaySchedule?.events[0]?.title || 'No more lectures today'}
            </p>
          </div>

          {/* Card 4: Study Notes */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Academic Notes</span>
              <BookOpen className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {overview?.summary?.totalNotes || 0}
              </span>
              <span className="text-xs text-slate-500">
                ({overview?.pinnedNotes?.length || 0} pinned cheatsheets)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Markdown & tag-based search
            </p>
          </div>
        </div>

        {/* Core Multi-Module Interconnected Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLUMNS: Task-Calendar Integrated Schedule & Prioritized Task Board */}
          <div className="lg:col-span-7 space-y-6">
            {/* Task-Calendar Synchronized Agenda for Selected Date */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Synchronized Schedule Agenda
                    </h2>
                    <p className="text-xs text-slate-500">
                      Target Date: {selectedDate === todayStr ? 'Today, ' : ''}
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </p>
                  </div>
                </div>

                <Link
                  href="/calendar"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Full Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Combined Agenda Stream: Events + Task Deadlines */}
              {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400">No events or task deadlines scheduled for this date.</p>
                  <button
                    onClick={() => {
                      setQuickAddInitialTab('task');
                      setQuickAddOpen(true);
                    }}
                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add item for this day
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Academic Events for this date */}
                  {selectedDateEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setEventModalOpen(true);
                      }}
                      className="group p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
                          {evt.startTime}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {evt.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                evt.category === 'Exam'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : evt.category === 'Lab'
                                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400'
                                  : evt.category === 'Assignment'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                              }`}
                            >
                              {evt.category}
                            </span>
                          </div>
                          {evt.location && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {evt.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                        {evt.endTime ? `until ${evt.endTime}` : ''}
                      </span>
                    </div>
                  ))}

                  {/* Synchronized Task Deadlines for this date */}
                  {selectedDateTasks.map((tsk) => (
                    <div
                      key={tsk._id}
                      onClick={() => {
                        setSelectedTask(tsk);
                        setTaskModalOpen(true);
                      }}
                      className="group p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleToggleTask(tsk._id, e)}
                          className="text-slate-400 hover:text-emerald-500 transition"
                        >
                          {tsk.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium text-xs sm:text-sm ${
                                tsk.status === 'completed'
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {tsk.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tsk.priority === 'High'
                                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : tsk.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              ⚡ Deadline ({tsk.priority})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Course: {tsk.courseCode || 'General'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {tsk.status === 'completed' ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prioritized Task Board Module */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Prioritized Academic Tasks
                    </h2>
                    <p className="text-xs text-slate-500">
                      High, Medium, Low priority levels with one-click completion.
                    </p>
                  </div>
                </div>

                <Link
                  href="/tasks"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>All Tasks ({tasks.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Task Priority Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'High', 'Medium', 'Low', 'Pending', 'Completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTaskFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                      taskFilter === tab
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'High' ? '🔴 High' : tab === 'Medium' ? '🟡 Medium' : tab === 'Low' ? '🟢 Low' : tab}
                  </button>
                ))}
              </div>

              {/* Inline Quick Task Creator */}
              <form onSubmit={handleInlineQuickTask} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Add a quick task for this week..."
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <select
                  value={quickTaskPriority}
                  onChange={(e) => setQuickTaskPriority(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none"
                >
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Med</option>
                  <option value="Low">🟢 Low</option>
                </select>
                <button
                  type="submit"
                  disabled={!quickTaskTitle.trim()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40"
                >
                  Add
                </button>
              </form>

              {/* Task Items List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No tasks found matching filter "{taskFilter}".
                  </p>
                ) : (
                  filteredTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => {
                        setSelectedTask(t);
                        setTaskModalOpen(true);
                      }}
                      className="group p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                        <button
                          onClick={(e) => handleToggleTask(t._id, e)}
                          className="text-slate-400 hover:text-emerald-500 transition shrink-0"
                        >
                          {t.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs sm:text-sm font-medium truncate ${
                              t.status === 'completed'
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span>Due: {t.dueDate}</span>
                            <span>•</span>
                            <span>{t.courseCode || 'General'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.priority === 'High'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                              : t.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: Mini-Calendar Navigation & Personal Academic Notes */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive Mini Calendar Widget */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {monthNames[month]} {year}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentCalendarDate(new Date())}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {/* Empty cells for preceding days */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const iso = formatDateISO(dayNum);
                  const isToday = iso === todayStr;
                  const isSelected = iso === selectedDate;

                  // Check if any events or task deadlines fall on this date
                  const dayEvents = events.filter((e) => e.date === iso);
                  const dayTasks = tasks.filter((t) => t.dueDate === iso);
                  const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
                  const hasHighPriority = dayTasks.some((t) => t.priority === 'High' && t.status !== 'completed');

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDate(iso)}
                      className={`h-8 rounded-lg relative flex flex-col items-center justify-center font-medium transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : isToday
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {/* Dots indicators */}
                      {hasItems && (
                        <div className="absolute bottom-1 flex items-center gap-0.5">
                          {hasHighPriority ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          ) : (
                            <span
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-indigo-500'
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Class/Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Task Deadline</span>
                </div>
                <Link href="/calendar" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Full View →
                </Link>
              </div>
            </div>

            {/* Personal Academic Notes Module */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notes & Cheatsheets
                    </h2>
                    <p className="text-xs text-slate-500">Tag-searchable rich notes</p>
                  </div>
                </div>

                <Link
                  href="/notes"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>All Notes ({notes.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Note Cards */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {notes.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No notes recorded yet.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note);
                        setNoteModalOpen(true);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {note.title}
                        </h4>
                        {note.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-indigo-500 fill-current shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {note.content.replace(/[#*`>-]/g, '').trim()}
                      </p>

                      {/* Tag chips */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Modals */}
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
