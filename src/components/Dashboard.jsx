import { useMemo } from 'react';
import { getHabits, getUsername, getCompletions, streakForHabit, bestPerformingHabit, consistencyScore } from './storage';
import { Quote } from 'lucide-react';

const QUOTES = [
  'Small steps, big changes.',
  'Consistency beats intensity.',
  'You become what you repeat.',
  'Win the day. Then repeat.',
  'Habits compound like interest.'
];

export default function Dashboard({ onNavigate }) {
  const name = getUsername();
  const habits = getHabits();
  const completions = getCompletions();

  const todayCount = useMemo(() => {
    const today = new Date();
    const key = today.toISOString().slice(0,10);
    return (completions[key] || []).length;
  }, [completions]);

  const totalHabits = habits.length;

  const streak = useMemo(() => {
    // Sum of best streak among habits
    let max = 0;
    habits.forEach(h => { max = Math.max(max, streakForHabit(h.id)); });
    return max;
  }, [habits]);

  const quote = useMemo(() => {
    const idx = new Date().getDate() % QUOTES.length;
    return QUOTES[idx];
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 bg-white/70 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Welcome, {name || 'Friend'}</h2>
          <nav className="flex gap-2">
            {[
              ['Manage Habits','manage'],
              ['Progress','progress'],
              ['History','history'],
              ['Settings','settings']
            ].map(([label, key]) => (
              <button key={key} onClick={() => onNavigate(key)} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total habits" value={totalHabits} />
          <StatCard label="Today completed" value={todayCount} />
          <StatCard label="Best streak" value={streak} />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4">
          <Highlights />
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 pt-2">
        <div className="mt-6 flex items-start gap-3 text-slate-600 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <Quote className="w-5 h-5 text-emerald-600 mt-1" />
          <p className="text-sm">{quote}</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-3xl font-semibold text-slate-800 mt-2">{value}</p>
    </div>
  );
}

function Highlights() {
  const best = bestPerformingHabit();
  const score = consistencyScore();
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-6 border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800">Your momentum</h3>
      <p className="text-slate-600 mt-2 text-sm">
        {best ? (
          <span>
            Best performing habit: <span className="font-medium text-slate-800">{best.habit.name}</span> ({best.count} total completions)
          </span>
        ) : 'Add a habit to get started!'}
      </p>
      <p className="text-slate-600 mt-1 text-sm">Current consistency score: <span className="font-medium text-emerald-700">{score}%</span></p>
    </div>
  );
}
