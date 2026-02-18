import React, { useState, useEffect } from 'react';
import ApiService from './services/api';
import './App.css';
import safehdfLogo from './assets/safehdf-logo.jpg';

// Components
import Tasks from './components/Tasks';
import Calendar from './components/Calendar';
import Stock from './components/Stock';
import Overview from './components/Overview';
import PriseDeCote from './components/PriseDeCote';

// Icons
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Package, Camera } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'calendar', label: 'Rendez-vous', icon: CalendarIcon },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'prise-de-cote', label: 'Prise de Côte', icon: Camera },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'tasks': return <Tasks />;
      case 'calendar': return <Calendar />;
      case 'stock': return <Stock />;
      case 'prise-de-cote': return <PriseDeCote />;
      default: return <Overview />;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo-container">
          <img className="logo-image" src={safehdfLogo} alt="Safe HDF" />
        </div>
        
        <nav className="nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
        </header>
        <div className="content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;