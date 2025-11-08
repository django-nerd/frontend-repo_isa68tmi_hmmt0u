import { useEffect, useMemo, useRef } from 'react';
import { allCompletionDates, getCompletions, getHabits } from './storage';

export default function ProgressPage() {
  const canvasRef = useRef(null);
  const habits = getHabits();
  const completions = getCompletions();

  // Prepare data for simple chart (no external deps)
  const labels = useMemo(() => {
    // last 14 days labels
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  }, []);

  const data = useMemo(() => {
    // total completions per day for last 14 days
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      arr.push((completions[key] || []).length);
    }
    return arr;
  }, [completions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // draw clean minimal bar chart
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = 200;
    ctx.clearRect(0,0,w,h);

    const max = Math.max(4, ...data);
    const pad = 24;
    const barW = (w - pad * 2) / data.length * 0.6;
    const step = (w - pad * 2) / data.length;

    // axis
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    // bars
    data.forEach((v, i) => {
      const x = pad + i * step + (step - barW) / 2;
      const barH = ((h - pad * 2) * v) / max;
      const y = h - pad - barH;
      const grd = ctx.createLinearGradient(0, y, 0, y + barH);
      grd.addColorStop(0, '#10b981');
      grd.addColorStop(1, '#34d399');
      ctx.fillStyle = grd;
      ctx.fillRect(x, y, barW, barH);
    });

    // labels (sparse)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, system-ui, sans-serif';
    labels.forEach((l, i) => {
      if (i % 3 !== 0) return;
      const x = pad + i * step + step / 2;
      ctx.fillText(l, x - 12, h - 6);
    });
  }, [labels, data]);

  const best = useMemo(() => {
    const counts = {};
    Object.values(completions).forEach(list => list.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    }));
    let res = null; let mx = -1;
    habits.forEach(h => {
      const c = counts[h.id] || 0;
      if (c > mx) { mx = c; res = h; }
    });
    return res ? `${res.name} (${mx})` : 'N/A';
  }, [completions, habits]);

  const consistency = useMemo(() => {
    const dates = allCompletionDates();
    if (dates.length === 0) return '0%';
    const daysSet = new Set(dates);
    // last 14 days
    let hit = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      if (daysSet.has(key)) hit++;
    }
    return `${Math.round((hit/14)*100)}%`;
  }, [completions]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800">Progress Overview</h3>
        <div className="mt-4">
          <canvas ref={canvasRef} className="w-full h-52"/>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Best performing habit</p>
          <p className="text-lg font-medium text-slate-800 mt-1">{best}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Current consistency score</p>
          <p className="text-lg font-medium text-emerald-700 mt-1">{consistency}</p>
        </div>
      </div>
    </div>
  );
}
