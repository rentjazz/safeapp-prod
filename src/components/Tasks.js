import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { CheckCircle, Circle, Plus, Trash2, Calendar } from 'lucide-react';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [listId, setListId] = useState('@default');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTasks();
      // Google Tasks API returns items in data
      const items = data.items || [];
      setTasks(items.sort((a, b) => {
        // Non complétés d'abord
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return 0;
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      const updated = {
        ...task,
        status: task.status === 'completed' ? 'needsAction' : 'completed'
      };
      await ApiService.updateTask(listId, task.id, updated);
      loadTasks();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await ApiService.deleteTask(listId, taskId);
      loadTasks();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await ApiService.createTask({
        listId,
        title: newTask
      });
      setNewTask('');
      loadTasks();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="tasks-container">
      <form onSubmit={addTask} className="add-task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nouvelle tâche..."
          className="task-input"
        />
        <button type="submit" className="btn-primary">
          <Plus size={20} />
        </button>
      </form>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty">Aucune tâche</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
              <button 
                className="task-toggle"
                onClick={() => toggleTask(task)}
              >
                {task.status === 'completed' ? <CheckCircle size={22} /> : <Circle size={22} />}
              </button>
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.due && (
                  <span className="task-date">
                    <Calendar size={14} /> {formatDate(task.due)}
                  </span>
                )}
              </div>
              <button 
                className="task-delete"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;