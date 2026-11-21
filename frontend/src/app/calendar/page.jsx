'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import QuickAddModal from '../../components/QuickAddModal';
import EventModal from '../../components/EventModal';
import TaskModal from '../../components/TaskModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ events: [], taskDeadlines: [], combined: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const loadCalendarData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getCalendarSync({ month: monthStr });
      if (res.success && res.data) {
        setCalendarData(res.data);
      }
    } catch (err) {
      console.error('Failed to load calendar sync data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, monthStr]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // One-click task toggle from calendar
  const handleToggleTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await api.toggleTask(taskId);
      loadCalendarData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Month grid calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayISO = new Date().toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Helper to format ISO date
  const getISOString = (dayNum) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  };

  // Week View calculation (Sunday to Saturday for current week)
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day;
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(diff + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  // Filter items by category
  const filterItems = (items) => {
    if (selectedCategory === 'All') return items;
    if (selectedCategory === 'Deadlines') return items.filter((i) => i.isTaskDeadline);
    return items.filter((i) => i.category === selectedCategory);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadCalendarData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Calendar Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Academic Calendar & Deadline Sync
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                ⚡ Task-to-Calendar Synchronized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Visualize coursework, lab sessions, exams, and prioritized task deadlines in one connected view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Month View
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Week View
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* Academic Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-xs font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'All', label: 'All Items' },
            { id: 'Deadlines', label: '⚡ Task Deadlines' },
            { id: 'Lecture', label: '📘 Lectures' },
            { id: 'Lab', label: '🔬 Lab Sessionals' },
            { id: 'Exam', label: '📝 Exams' },
            { id: 'Assignment', label: '📁 Assignments' },
            { id: 'Personal', label: '☕ Personal' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Deadline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Academic Class
                </span>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2 text-xs font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
              <span>Sunday</span>
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
              <span>Saturday</span>
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Preceding blank days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="bg-slate-50/30 dark:bg-slate-950/20 p-2" />
              ))}

              {/* Active days in month */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const isoDate = getISOString(dayNum);
                const isToday = isoDate === todayISO;

                // Filter items for this day
                const dayItems = filterItems(calendarData.combined.filter((item) => item.date === isoDate));

                return (
                  <div
                    key={`day-cell-${dayNum}`}
                    className={`p-1.5 sm:p-2 transition group flex flex-col justify-between overflow-hidden ${
                      isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayItems.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dayItems.length} item{dayItems.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Scrollable list of badges */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px] pr-0.5">
                      {dayItems.map((item) => {
                        if (item.isTaskDeadline) {
                          // TASK DEADLINE BADGE
                          return (
                            <div
                              key={item._id}
                              onClick={() => {
                                setSelectedTask({
                                  _id: item.originalTaskId,
                                  title: item.title,
                                  description: item.description,
                                  priority: item.priority,
                                  dueDate: item.date,
                                  status: item.status,
                                  courseCode: item.courseCode,
                                });
                                setTaskModalOpen(true);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-medium border truncate cursor-pointer flex items-center justify-between gap-1 transition ${
                                item.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                                  : item.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                              }`}
                            >
                              <span className={`truncate ${item.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                ⚡ {item.title}
                              </span>
                              <button
                                onClick={(e) => handleToggleTask(item.originalTaskId, e)}
                                className="shrink-0 hover:scale-110 transition"
                              >
                                {item.status === 'completed' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Circle className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                            </div>
                          );
                        }

                        // CALENDAR EVENT BADGE
                        return (
                          <div
                            key={item._id}
                            onClick={() => {
                              setSelectedEvent(item);
                              setEventModalOpen(true);
                            }}
                            className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900 truncate cursor-pointer transition flex items-center gap-1"
                          >
                            <span className="font-mono text-[9px] opacity-75">{item.startTime}</span>
                            <span className="truncate">{item.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'week' && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden p-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Week of {getWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {getWeekDays()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {getWeekDays().map((day) => {
                const dayISO = day.toISOString().split('T')[0];
                const isToday = dayISO === todayISO;
                const items = filterItems(calendarData.combined.filter((i) => i.date === dayISO));

                return (
                  <div
                    key={dayISO}
                    className={`p-3 rounded-xl border flex flex-col justify-between min-h-[300px] ${
                      isToday
                        ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                        : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {day.getDate()}
                          </p>
                        </div>
                        {isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-4 text-center">No agenda</p>
                        ) : (
                          items.map((item) => (
                            <div
                              key={item._id}
                              onClick={() => {
                                if (item.isTaskDeadline) {
                                  setSelectedTask({
                                    _id: item.originalTaskId,
                                    title: item.title,
                                    description: item.description,
                                    priority: item.priority,
                                    dueDate: item.date,
                                    status: item.status,
                                    courseCode: item.courseCode,
                                  });
                                  setTaskModalOpen(true);
                                } else {
                                  setSelectedEvent(item);
                                  setEventModalOpen(true);
                                }
                              }}
                              className={`p-2 rounded-lg border text-xs cursor-pointer transition ${
                                item.isTaskDeadline
                                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                                  : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold truncate">
                                  {item.isTaskDeadline ? '⚡ Deadline' : item.startTime}
                                </span>
                                {item.isTaskDeadline && (
                                  <span className="text-[10px] font-bold">{item.priority}</span>
                                )}
                              </div>
                              <p className="font-medium mt-1 text-[11px] line-clamp-2">{item.title}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setQuickAddOpen(true)}
                      className="mt-3 w-full py-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-indigo-400 transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        initialTab="event"
        onCreated={() => loadCalendarData()}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={selectedEvent}
        onUpdated={() => loadCalendarData()}
        onDeleted={() => loadCalendarData()}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onUpdated={() => loadCalendarData()}
        onDeleted={() => loadCalendarData()}
      />
    </div>
  );
}
