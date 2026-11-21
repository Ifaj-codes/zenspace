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
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ events: [], taskDeadlines: [], combined: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getCalendarSync({ month: monthStr });
      if (res.success && res.data) {
        setCalendarData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, monthStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleToggleTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await api.toggleTask(taskId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayISO = new Date().toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getISO = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const filterItems = (items) => {
    if (selectedCategory === 'All') return items;
    if (selectedCategory === 'Deadlines') return items.filter((i) => i.isTaskDeadline);
    return items.filter((i) => i.category === selectedCategory);
  };

  // Compute week days for Week View
  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day;
    const weekStart = new Date(curr.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadData} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle-light dark:border-border-subtle-dark pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-brand dark:text-brand-dark px-2 py-0.5 rounded bg-matcha-100/70 dark:bg-matcha-900/30">
                Synchronized Timetable
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight">
              {monthNames[month]} {year}
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5">
              BAIUST academic class schedule and coursework deadlines.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode */}
            <div className="flex items-center bg-surface-muted-light dark:bg-surface-muted-dark p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === 'month'
                    ? 'bg-surface-light dark:bg-surface-dark shadow-xs text-brand dark:text-brand-dark font-semibold'
                    : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === 'week'
                    ? 'bg-surface-light dark:bg-surface-dark shadow-xs text-brand dark:text-brand-dark font-semibold'
                    : 'text-ink-muted-light dark:text-ink-muted-dark hover:text-ink-primary-light'
                }`}
              >
                Week
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1 bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark rounded-lg p-0.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-medium hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark rounded transition"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'All', label: 'All Items' },
            { id: 'Deadlines', label: 'Deadlines' },
            { id: 'Lecture', label: 'Lectures' },
            { id: 'Lab', label: 'Labs' },
            { id: 'Exam', label: 'Exams' },
            { id: 'Assignment', label: 'Assignments' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-md transition ${
                selectedCategory === cat.id
                  ? 'bg-matcha-100 dark:bg-matcha-900/40 font-semibold text-brand dark:text-brand-dark shadow-xs'
                  : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light hover:bg-surface-muted-light/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Month View Grid */}
        {viewMode === 'month' && (
          <div className="border border-border-subtle-light dark:border-border-subtle-dark rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark shadow-xs">
            <div className="grid grid-cols-7 border-b border-border-subtle-light dark:border-border-subtle-dark text-center py-2.5 text-[11px] font-semibold text-ink-secondary-light dark:text-ink-secondary-dark bg-surface-muted-light/40 dark:bg-surface-muted-dark/40">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-border-subtle-light dark:divide-border-subtle-dark">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} className="bg-canvas-light/40 dark:bg-canvas-dark/40 p-2" />
              ))}

              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const iso = getISO(dayNum);
                const isToday = iso === todayISO;
                const dayItems = filterItems(calendarData.combined.filter((item) => item.date === iso));

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`p-2 flex flex-col justify-between overflow-hidden transition ${
                      isToday ? 'bg-matcha-50/50 dark:bg-matcha-950/20' : 'hover:bg-surface-muted-light/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center font-bold'
                            : 'text-ink-secondary-light dark:text-ink-secondary-dark'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                      {dayItems.map((item) => {
                        if (item.isTaskDeadline) {
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
                              className="px-1.5 py-0.5 rounded text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60 truncate cursor-pointer flex items-center justify-between gap-1 shadow-xs"
                            >
                              <span className={`truncate ${item.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                ⚠ {item.title}
                              </span>
                              <button
                                onClick={(e) => handleToggleTask(item.originalTaskId, e)}
                                className="shrink-0"
                              >
                                {item.status === 'completed' && <Check className="w-2.5 h-2.5 text-brand" />}
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={item._id}
                            onClick={() => {
                              setSelectedEvent(item);
                              setEventModalOpen(true);
                            }}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-matcha-50/70 dark:bg-matcha-900/30 border border-matcha-200/50 dark:border-matcha-800/40 text-brand dark:text-brand-dark truncate cursor-pointer hover:border-brand transition shadow-xs"
                          >
                            <span className="font-mono text-[10px] mr-1">{item.startTime}</span>
                            <span className="truncate font-medium">{item.title}</span>
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

        {/* Week View Grid */}
        {viewMode === 'week' && (
          <div className="border border-border-subtle-light dark:border-border-subtle-dark rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark shadow-xs">
            <div className="grid grid-cols-7 divide-x divide-border-subtle-light dark:divide-border-subtle-dark min-h-[420px]">
              {weekDates.map((d) => {
                const iso = d.toISOString().split('T')[0];
                const isToday = iso === todayISO;
                const dayItems = filterItems(calendarData.combined.filter((item) => item.date === iso));

                return (
                  <div
                    key={iso}
                    className={`flex flex-col ${isToday ? 'bg-matcha-50/40 dark:bg-matcha-950/20' : ''}`}
                  >
                    <div className="p-3 border-b border-border-subtle-light dark:border-border-subtle-dark text-center bg-surface-muted-light/30 dark:bg-surface-muted-dark/30">
                      <p className="text-[11px] font-medium text-ink-muted-light dark:text-ink-muted-dark uppercase tracking-wider">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p
                        className={`text-sm font-mono mt-0.5 ${
                          isToday ? 'font-bold text-brand dark:text-brand-dark' : 'text-ink-primary-light dark:text-ink-primary-dark'
                        }`}
                      >
                        {d.getDate()}
                      </p>
                    </div>

                    <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                      {dayItems.length === 0 ? (
                        <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark text-center pt-6 italic">
                          No items
                        </p>
                      ) : (
                        dayItems.map((item) => (
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
                            className={`p-2 rounded-lg text-xs cursor-pointer transition shadow-xs ${
                              item.isTaskDeadline
                                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                                : 'bg-matcha-50/70 dark:bg-matcha-900/30 border border-matcha-200/50 dark:border-matcha-800/40 text-brand dark:text-brand-dark'
                            }`}
                          >
                            <div className="font-mono text-[10px] mb-0.5">
                              {item.startTime ? `${item.startTime} – ${item.endTime}` : 'Deadline'}
                            </div>
                            <p className="font-medium line-clamp-2">{item.title}</p>
                            {item.location && (
                              <p className="text-[10px] opacity-75 mt-1">{item.location}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
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
        onCreated={() => loadData()}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={selectedEvent}
        onUpdated={() => loadData()}
        onDeleted={() => loadData()}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onUpdated={() => loadData()}
        onDeleted={() => loadData()}
      />
    </div>
  );
}
