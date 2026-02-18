import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCalendarEvents();
      setEvents(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (event) => {
    if (event.start.dateTime) {
      return new Date(event.start.dateTime).toLocaleString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(event.start.date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="calendar-container">
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-purple)', marginBottom: '16px' }}>Prochains rendez-vous (7 jours)</h3>
      <div className="event-list">
        {events.length === 0 ? (
          <p className="empty">Aucun rendez-vous</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-icon">
                <CalendarIcon size={24} />
              </div>
              <div className="event-content">
                <h4 className="event-title">{event.summary}</h4>
                <p className="event-time">
                  <Clock size={14} /> {formatDate(event)}
                </p>
                {event.location && (
                  <p className="event-location">📍 {event.location}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Calendar;