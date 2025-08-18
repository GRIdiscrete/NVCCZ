'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, User, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Event, EventsData } from '@/types.db';





const EventsCalendar = ({ events }: { events: EventsData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter events based on search and filter
// Update the filteredEvents calculation to this:
const filteredEvents = events.data.filter(event => {
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterActive || event.isActive;
    return matchesSearch && matchesFilter;
  });

  // Get events for the selected day
  const selectedDayEvents = selectedDate
    ? filteredEvents.filter(event => isSameDay(parseISO(event.startDate), selectedDate))
    : [];

  // Generate days for the current month
  const renderDays = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }

    return days.map((day, i) => {
      const dayEvents = filteredEvents.filter(event => isSameDay(parseISO(event.startDate), day));
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      return (
        <motion.button
          key={i}
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`h-24 cursor-pointer overflow-hidden border border-input p-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40
            ${isCurrentMonth ? 'bg-card/60' : 'bg-muted/40 text-muted-foreground'} 
            ${isSelected ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setSelectedDate(day)}
          aria-pressed={!!isSelected}
          aria-current={isSelected ? 'date' : undefined}
          aria-label={`Select ${format(day, 'EEEE do MMMM')}${dayEvents.length ? `, ${dayEvents.length} event(s)` : ''}`}
        >
          <div className="flex items-start justify-between">
            <span className={`text-sm ${isSelected ? 'font-bold text-white' : ''}`}>{format(day, 'd')}</span>
            {dayEvents.length > 0 && <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />}
          </div>
          <div className="mt-1 max-h-16 space-y-1 overflow-y-auto">
            {dayEvents.slice(0, 2).map(event => (
              <div key={event.id} className="truncate rounded bg-blue-900/30 p-1 text-xs">
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-400">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </motion.button>
      );
    });
  };

  return (
    <div className="w-full h-full p-0">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">Company Events</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 rounded-lg bg-background/70 border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilterActive(!filterActive)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${filterActive ? 'bg-primary/10 border-primary text-primary' : 'bg-card/70 border-input text-foreground'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Active Only
          </button>
        </div>
      </div>

      {/* Calendar controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg border border-input bg-card/70 hover:bg-accent transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { const today = new Date(); setCurrentMonth(today); setSelectedDate(today); }}
            className="px-3 py-2 rounded-lg border border-input bg-card/70 text-sm hover:bg-accent transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg border border-input bg-card/70 hover:bg-accent transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-xl font-semibold text-foreground" aria-live="polite">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden mb-6 bg-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 bg-card text-center text-foreground/80 font-medium">
            {day}
          </div>
        ))}
        {renderDays()}
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border border-input bg-card/80 backdrop-blur"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">
            Events on {format(selectedDate, 'MMMM do, yyyy')}
          </h3>
          
          {selectedDayEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDayEvents.map(event => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-lg bg-card/60 border border-input"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-foreground">{event.title}</h4>
                    {event.isActive ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{event.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <User className="w-4 h-4 mr-2" />
                      {event.author.firstName} {event.author.lastName}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events scheduled for this day</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EventsCalendar;