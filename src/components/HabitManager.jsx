import { useMemo, useState } from 'react';
import { addHabit, getHabits, markCompleted, isHabitCompletedOn, todayKey } from './storage';

export default function HabitManager() {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [tick, setTick] = useState(0);

  const habits = useMemo(() => getHabits(), [tick]);

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addHabit(trimmed, frequency);
    setName('');
    setTick(x => x + 1);
  };

  const handleComplete = (id) => {
    markCompleted(id, new Date());
    setTick(x => x + 1);
  };

  const today = todayKey(new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800">Add Habit</h3>
        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option>Daily</option>
            <option>Weekly</option>
          </select>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl">Add</button>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800">Your Habits</h3>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {habits.length === 0 && (
            <p className="text-slate-500">No habits yet. Add your first habit above.</p>
          )}
          {habits.map(h => {
            const completed = isHabitCompletedOn(h.id, new Date());
            return (
              <div key={h.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div>
                  <p className="font-medium text-slate-800">{h.name}</p>
                  <p className="text-xs text-slate-500">{h.frequency} • {today}</p>
                </div>
                <button
                  onClick={() => handleComplete(h.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${completed ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  {completed ? 'Completed' : 'Mark Completed'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
