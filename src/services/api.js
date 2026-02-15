const N8N_URL = window.N8N_URL || 'https://n8n.superprojetx.com';

console.log('n8n URL:', N8N_URL);

class ApiService {
  // Tasks
  static async getTasks() {
    const res = await fetch(`${N8N_URL}/webhook/safeapp-tasks`);
    if (!res.ok) throw new Error('Erreur tâches');
    return res.json();
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
    const res = await fetch(`${N8N_URL}/webhook/safeapp-calendar`);
    if (!res.ok) throw new Error('Erreur calendrier');
    return res.json();
  }

  // Stock
  static async getStock() {
    const res = await fetch(`${N8N_URL}/webhook/safeapp-stock`);
    if (!res.ok) throw new Error('Erreur stock');
    return res.json();
  }
}

export default ApiService;