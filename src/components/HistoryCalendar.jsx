import { useMemo, useState } from 'react';
import { completionsForDate, getHabits } from './storage';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return d;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export default function HistoryCalendar() {
  const [current, setCurrent] = useState(new Date());
  const habits = getHabits();
  const habitsById = useMemo(() => Object.fromEntries(habits.map(h => [h.id, h])), [habits]);

  const days = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startWeekday = (start.getDay() + 6) % 7; // Mon=0
    const total = startWeekday + end.getDate();
    const rows = Math.ceil(total / 7);
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 7; c++) {
        const idx = r * 7 + c;
        const dayNum = idx - startWeekday + 1;
        const inMonth = dayNum >= 1 && dayNum <= end.getDate();
        const date = inMonth ? new Date(current.getFullYear(), current.getMonth(), dayNum) : null;
        arr.push({ inMonth, date });
      }
    }
    return arr;
  }, [current]);

  const [hoverInfo, setHoverInfo] = useState(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(addMonths(current, -1))} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-slate-800">
            {current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="text-xs font-medium text-slate-500">{d}</div>
          ))}
          {days.map((cell, i) => {
            if (!cell.inMonth) return <div key={i} className="h-20 rounded-xl bg-transparent" />;
            const list = completionsForDate(cell.date);
            const has = list.length > 0;
            return (
              <div
                key={i}
                className={`relative h-20 rounded-xl border ${has ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'} flex flex-col items-center justify-center`}
                onMouseEnter={() => setHoverInfo({ date: cell.date, list })}
                onMouseLeave={() => setHoverInfo(null)}
              >
                <div className="text-sm font-medium text-slate-700">{cell.date.getDate()}</div>
                {has && <Check className="w-4 h-4 text-emerald-600 mt-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {hoverInfo && (
        <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-sm text-slate-500">{hoverInfo.date.toDateString()}</p>
          <ul className="mt-2 list-disc list-inside text-slate-700 text-sm">
            {hoverInfo.list.length === 0 && <li>No habits completed</li>}
            {hoverInfo.list.map(id => (
              <li key={id}>{habitsById[id]?.name || 'Unknown habit'}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
