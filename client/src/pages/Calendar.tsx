import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  currentBalance?: number;
  debt?: number;
  apr: number;
  dueDate?: string;
  lastFourDigits?: string;
  pointsBalance?: number;
  rewardType?: 'points' | 'miles' | 'cashback' | 'hotel' | 'travel';
  bank?: string;
  calculatedMinimumPayment?: number;
  interestPortion?: number;
  principalPortion?: number;
  payoffTimeMonths?: number;
}

interface CalendarProps {
  isDarkMode: boolean;
  creditCards?: CreditCard[];
}

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'deadline' | 'reminder' | 'meeting';
  description?: string;
}

export default function Calendar({ isDarkMode, creditCards = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'reminder' as Event['type'],
    description: ''
  });

  // Generate credit card due date events
  const generateCreditCardEvents = (cards: CreditCard[]): Event[] => {
    const cardEvents: Event[] = [];

    cards.forEach(card => {
      if (card.dueDate) {
        const dueDate = new Date(card.dueDate);

        // Add the due date event
        cardEvents.push({
          id: `cc-${card.id}-due`,
          title: `${card.name} Payment Due`,
          date: dueDate,
          type: 'deadline',
          description: `Payment due for ${card.name}${card.lastFourDigits ? ` (****${card.lastFourDigits})` : ''}. Minimum payment: $${card.calculatedMinimumPayment?.toFixed(2) || 'N/A'}`
        });

        // Add a reminder 3 days before due date
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - 3);
        cardEvents.push({
          id: `cc-${card.id}-reminder`,
          title: `${card.name} Payment Reminder`,
          date: reminderDate,
          type: 'reminder',
          description: `${card.name} payment is due in 3 days on ${dueDate.toLocaleDateString()}`
        });
      }
    });

    return cardEvents;
  };

  // Regenerate credit card events when credit cards change
  const [creditCardEvents, setCreditCardEvents] = useState<Event[]>([]);

  useEffect(() => {
    const newCreditCardEvents = generateCreditCardEvents(creditCards);
    setCreditCardEvents(newCreditCardEvents);
  }, [creditCards]);

  // Combine user events with credit card events
  const allEvents = [...events, ...creditCardEvents];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's days to fill the first week
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add next month's days to fill the last week
    const remainingCells = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event =>
      event.date.toDateString() === date.toDateString()
    );
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim()) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: selectedDate,
        type: newEvent.type,
        description: newEvent.description
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', type: 'reminder', description: '' });
      setShowEventForm(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'reminder': return 'bg-yellow-500';
      case 'meeting': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  // Separate user events from credit card events for display
  const userEvents = events.filter(event =>
    event.date.toDateString() === selectedDate.toDateString()
  );
  const selectedCreditCardEvents = creditCardEvents.filter(event =>
    event.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className={`min-h-screen p-8 transition-colors duration-200 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-amber-50 via-white to-amber-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mr-3">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
              Calendar
            </h1>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Manage your financial appointments, deadlines, and important dates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-xl shadow-lg border transition-all duration-200 ${
              isDarkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                : 'bg-gradient-to-br from-white to-orange-50 border-gray-200'
            } backdrop-blur-sm`}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-orange-100 text-gray-600'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold text-center">
                  {formatMonth(currentDate)}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-orange-100 text-gray-600'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className={`text-center py-2 font-medium text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isSelected = day.date.toDateString() === selectedDate.toDateString();
                  const isToday = day.date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day.date)}
                      className={`relative h-12 w-full rounded-lg transition-all duration-200 ${
                        day.isCurrentMonth
                          ? isSelected
                            ? 'bg-orange-500 text-white shadow-lg'
                            : isToday
                              ? 'bg-orange-100 text-orange-600 border-2 border-orange-500'
                              : isDarkMode
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-orange-50 text-gray-700'
                          : isDarkMode
                            ? 'text-gray-500 hover:bg-gray-800'
                            : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{day.date.getDate()}</span>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.type)}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* Selected Date Events */}
            <div className={`p-6 rounded-xl shadow-lg border transition-all duration-200 ${
              isDarkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                : 'bg-gradient-to-br from-white to-orange-50 border-gray-200'
            } backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateEvents.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No events for this date
                  </p>
                ) : (
                  <>
                    {/* Credit Card Events */}
                    {selectedCreditCardEvents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-red-500">Payment Due Dates</h4>
                        <div className="space-y-2">
                          {selectedCreditCardEvents.map(event => (
                            <div
                              key={event.id}
                              className={`p-3 rounded-lg border-2 border-red-200 ${
                                isDarkMode
                                  ? 'bg-red-900/20 border-red-700'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                                    <span className="font-medium text-sm">{event.title}</span>
                                  </div>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {event.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Events */}
                    {userEvents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-blue-500">Your Events</h4>
                        <div className="space-y-2">
                          {userEvents.map(event => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                            <span className="font-medium text-sm">{event.title}</span>
                          </div>
                          {event.description && (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {event.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className={`p-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors ${
                            isDarkMode ? 'hover:bg-red-900' : ''
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className={`p-6 rounded-xl shadow-lg border transition-all duration-200 ${
              isDarkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                : 'bg-gradient-to-br from-white to-orange-50 border-gray-200'
            } backdrop-blur-sm`}>
              <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {allEvents
                  .filter(event => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {event.date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {allEvents.filter(event => event.date >= new Date()).length === 0 && (
                  <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No upcoming events
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-xl shadow-xl max-w-md w-full mx-4 ${
              isDarkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className="text-xl font-semibold mb-4">Add Event</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="reminder">Reminder</option>
                    <option value="appointment">Appointment</option>
                    <option value="deadline">Deadline</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Add Event
                  </button>
                  <button
                    onClick={() => setShowEventForm(false)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
