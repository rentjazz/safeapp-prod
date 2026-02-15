import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Package, AlertTriangle } from 'lucide-react';

function Stock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getStock();
      // Google Sheets returns array of arrays
      const rows = data || [];
      const headers = rows[0] || ['Référence', 'Nom', 'Qté', 'Min', 'Emplacement', 'Fournisseur'];
      const items = rows.slice(1).map((row, index) => ({
        id: index,
        reference: row[0] || '',
        name: row[1] || '',
        quantity: parseInt(row[2]) || 0,
        minQuantity: parseInt(row[3]) || 0,
        location: row[4] || '',
        supplier: row[5] || ''
      }));
      setItems(items);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lowStock = items.filter(item => item.quantity <= item.minQuantity && item.minQuantity > 0);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="stock-container">
      <div className="stock-stats">
        <div className="stat-card">
          <Package size={32} />
          <div>
            <h3>{items.length}</h3>
            <p>Articles</p>
          </div>
        </div>
        <div className="stat-card warning">
          <AlertTriangle size={32} />
          <div>
            <h3>{lowStock.length}</h3>
            <p>Stock faible</p>
          </div>
        </div>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Nom</th>
            <th>Qté</th>
            <th>Min</th>
            <th>Emplacement</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className={item.quantity <= item.minQuantity ? 'low-stock' : ''}>
              <td>{item.reference}</td>
              <td>{item.name}</td>
              <td className={item.quantity <= item.minQuantity ? 'warning' : ''}>
                {item.quantity}
              </td>
              <td>{item.minQuantity}</td>
              <td>{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Stock;