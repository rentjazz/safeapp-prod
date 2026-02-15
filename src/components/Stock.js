import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Package, AlertTriangle, Plus, Minus, Save, X } from 'lucide-react';

function Stock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getStock();
      console.log('Stock data:', data);
      
      // Les données sont déjà un tableau
      const stockItems = Array.isArray(data) ? data : [];
      
      // Trier par type puis marque
      stockItems.sort((a, b) => {
        if (a.Type !== b.Type) return (a.Type || '').localeCompare(b.Type || '');
        return (a.Marque || '').localeCompare(b.Marque || '');
      });
      
      setItems(stockItems);
      setError(null);
    } catch (err) {
      console.error('Stock error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.row_number);
    setEditValue(item['Quantité restante'] || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (item) => {
    try {
      await ApiService.updateStock(item.row_number, parseInt(editValue) || 0);
      setEditingId(null);
      loadStock();
    } catch (err) {
      alert('Erreur de mise à jour: ' + err.message);
    }
  };

  const adjustQuantity = (delta) => {
    setEditValue((prev) => {
      const current = parseInt(prev) || 0;
      return Math.max(0, current + delta);
    });
  };

  const lowStock = items.filter(item => 
    parseInt(item['Quantité restante']) <= parseInt(item['Quantité minimale']) && 
    parseInt(item['Quantité minimale']) > 0
  );

  const formatCurrency = (value) => {
    if (!value || value === '?') return '-';
    return parseFloat(value).toFixed(2) + ' €';
  };

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

      <div className="stock-table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Qté Restante</th>
              <th>Qté Min</th>
              <th>Prix HT</th>
              <th>Valeur HT</th>
              <th>Fournisseur</th>
              <th>Emplacement</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const isLowStock = 
                parseInt(item['Quantité restante']) <= parseInt(item['Quantité minimale']) && 
                parseInt(item['Quantité minimale']) > 0;
              const isEditing = editingId === item.row_number;
              
              return (
                <tr key={item.row_number || index} className={isLowStock ? 'low-stock' : ''}>
                  <td>{item.Type}</td>
                  <td>{item.Marque}</td>
                  <td>{item['Modéle']}</td>
                  <td className="quantity-cell">
                    {isEditing ? (
                      <div className="quantity-editor">
                        <button onClick={() => adjustQuantity(-1)} className="qty-btn">
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="qty-input"
                        />
                        <button onClick={() => adjustQuantity(1)} className="qty-btn">
                          <Plus size={16} />
                        </button>
                        <button onClick={() => saveEdit(item)} className="save-btn">
                          <Save size={16} />
                        </button>
                        <button onClick={cancelEdit} className="cancel-btn">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span 
                        className={`quantity ${isLowStock ? 'warning' : ''}`}
                        onClick={() => startEdit(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item['Quantité restante']}
                      </span>
                    )}
                  </td>
                  <td>{item['Quantité minimale']}</td>
                  <td>{formatCurrency(item['tarif unitaire HT'])}</td>
                  <td>{formatCurrency(item['Valeur stock HT'])}</td>
                  <td>{item.Fournisseur}</td>
                  <td>{item['Lieu de stockage']}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <p className="stock-hint">Cliquez sur une quantité pour la modifier</p>
    </div>
  );
}

export default Stock;
