import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { CheckSquare, Calendar, Package, AlertCircle } from 'lucide-react';

function Overview() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, eventsData, stockData] = await Promise.all([
        ApiService.getTasks().catch(() => ({ items: [] })),
        ApiService.getCalendarEvents().catch(() => ({ items: [] })),
        ApiService.getStock().catch(() => [])
      ]);

      setTasks((tasksData.items || []).filter(t => t.status !== 'completed').slice(0, 5));
      setEvents((eventsData.items || []).slice(0, 5));
      
      const stockRows = stockData.slice(1) || [];
      setStock(stockRows.map((row, i) => ({
        id: i,
        name: row[1] || '',
        quantity: parseInt(row[2]) || 0,
        minQuantity: parseInt(row[3]) || 0
      })).filter(item => item.quantity <= item.minQuantity && item.minQuantity > 0).slice(0, 5));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="overview">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <CheckSquare size={32} />
          <div>
            <h3>{tasks.length}</h3>
            <p>Tâches en attente</p>
          </div>
        </div>
        <div className="stat-card green">
          <Calendar size={32} />
          <div>
            <h3>{events.length}</h3>
            <p>Rendez-vous (3j)</p>
          </div>
        </div>
        <div className="stat-card orange">
          <Package size={32} />
          <div>
            <h3>{stock.length}</h3>
            <p>Stock faible</p>
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3><CheckSquare size={20} /> Tâches prioritaires</h3>
          {tasks.length === 0 ? (
            <p className="empty">Aucune tâche en attente</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="dashboard-item">
                <span>{task.title}</span>
                {task.due && <small>{new Date(task.due).toLocaleDateString('fr-FR')}</small>}
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <h3><Calendar size={20} /> Prochains RDV</h3>
          {events.length === 0 ? (
            <p className="empty">Aucun rendez-vous</p>
          ) : (
            events.map(event => (
              <div key={event.id} className="dashboard-item">
                <span>{event.summary}</span>
                <small>
                  {event.start?.dateTime 
                    ? new Date(event.start.dateTime).toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})
                    : new Date(event.start?.date).toLocaleDateString('fr-FR')
                  }
                </small>
              </div>
            ))
          }
        </div>

        {stock.length > 0 && (
          <div className="dashboard-card warning">
            <h3><AlertCircle size={20} /> Alertes Stock</h3>
            {stock.map(item => (
              <div key={item.id} className="dashboard-item">
                <span>{item.name}</span>
                <small className="warning">{item.quantity} / {item.minQuantity}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Overview;