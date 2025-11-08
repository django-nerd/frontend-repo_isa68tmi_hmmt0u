import { useMemo, useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import HabitManager from './components/HabitManager';
import ProgressPage from './components/ProgressPage';
import HistoryCalendar from './components/HistoryCalendar';
import { getUsername } from './components/storage';

function App() {
  const [route, setRoute] = useState('dashboard');
  const [user, setUser] = useState(getUsername());

  const isLoggedIn = useMemo(() => !!user, [user]);

  const handleLogin = (name) => {
    setUser(name);
    setRoute('dashboard');
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50">
      {route === 'dashboard' && <Dashboard onNavigate={setRoute} />}
      {route === 'manage' && <HabitManager />}
      {route === 'progress' && <ProgressPage />}
      {route === 'history' && <HistoryCalendar />}
      {route === 'settings' && (
        <div className="max-w-3xl mx-auto px-4 py-10 text-slate-600">
          <h3 className="text-xl font-semibold text-slate-800">Settings</h3>
          <p className="mt-2">More options coming soon.</p>
          <button onClick={() => setRoute('dashboard')} className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white">Back</button>
        </div>
      )}
    </div>
  );
}

export default App;
