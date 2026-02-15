const N8N_URL = window.N8N_URL || 'https://n8n.superprojetx.com';

console.log('n8n URL:', N8N_URL);

class ApiService {
  // Tasks
  static async getTasks() {
    try {
      const res = await fetch(`${N8N_URL}/webhook/safeapp-tasks`);
      console.log('Tasks response status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Tasks data:', data);
      // Ensure we return { items: [...] }
      if (data.items) return data;
      if (Array.isArray(data)) return { items: data };
      return { items: [data] };
    } catch (err) {
      console.error('Tasks error:', err);
      throw err;
    }
  }

  static async createTask(task) {
    const res = await fetch(`${N8N_URL}/webhook/safeapp-task-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Erreur création');
    return res.json();
  }

  static async updateTask(listId, taskId, task) {
    const res = await fetch(`${N8N_URL}/webhook/safeapp-task-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, taskId, ...task })
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
  }

  static async deleteTask(listId, taskId) {
    const res = await fetch(`${N8N_URL}/webhook/safeapp-task-delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, taskId })
    });
    if (!res.ok) throw new Error('Erreur suppression');
    return res.json();
  }

  // Calendar
  static async getCalendarEvents() {
    try {
      const res = await fetch(`${N8N_URL}/webhook/safeapp-calendar`);
      console.log('Calendar response status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Calendar data:', data);
      if (data.items) return data;
      if (Array.isArray(data)) return { items: data };
      return { items: [data] };
    } catch (err) {
      console.error('Calendar error:', err);
      throw err;
    }
  }

  // Stock
  static async getStock() {
    try {
      const res = await fetch(`${N8N_URL}/webhook/safeapp-stock`);
      console.log('Stock response status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Stock data:', data);
      return data;
    } catch (err) {
      console.error('Stock error:', err);
      throw err;
    }
  }
}

export default ApiService;
