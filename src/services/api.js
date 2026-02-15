const N8N_URL = window.N8N_URL || 'https://n8n.superprojetx.com';

console.log('SafeApp Dashboard v2.0.1');
console.log('n8n URL:', N8N_URL);

// Helper to extract data from n8n format
const extractItems = (data) => {
  console.log('Extract items from:', typeof data, data ? Object.keys(data).slice(0, 5) : 'null');
  if (!data) return [];
  // If it's already an array, return it
  if (Array.isArray(data)) return data;
  // If it has items property with n8n format
  if (data.items && Array.isArray(data.items)) {
    return data.items.map(item => item.json || item);
  }
  // If it's an object with numeric keys (n8n output format), convert to array
  if (typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);
    const numericKeys = keys.filter(k => !isNaN(parseInt(k)) && k === String(parseInt(k)));
    console.log('Object keys:', keys.length, 'Numeric keys:', numericKeys.length);
    if (numericKeys.length > 0) {
      const result = numericKeys.sort((a, b) => parseInt(a) - parseInt(b)).map(k => data[k]);
      console.log('Converted to array of', result.length, 'items');
      return result;
    }
  }
  // If it's a single object
  return [data];
};

class ApiService {
  // Tasks
  static async getTasks() {
    try {
      const res = await fetch(`${N8N_URL}/webhook/safeapp-tasks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { items: extractItems(data) };
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { items: extractItems(data) };
    } catch (err) {
      console.error('Calendar error:', err);
      throw err;
    }
  }

  // Stock
  static async getStock() {
    try {
      const res = await fetch(`${N8N_URL}/webhook/safeapp-stock`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return extractItems(data);
    } catch (err) {
      console.error('Stock error:', err);
      throw err;
    }
  }

  static async updateStock(rowId, quantite) {
    const res = await fetch(`${N8N_URL}/webhook/safeapp-stock-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowId, quantite })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export default ApiService;
