// LocalStorage helpers for AI Habit Mentor

const USER_KEY = 'ahm_username';
const HABITS_KEY = 'ahm_habits';
const COMPLETIONS_KEY = 'ahm_completions'; // { 'YYYY-MM-DD': [habitId, ...] }

export function getUsername() {
  return localStorage.getItem(USER_KEY) || '';
}

export function setUsername(name) {
  localStorage.setItem(USER_KEY, name);
}

export function getHabits() {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHabits(habits) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getCompletions() {
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCompletions(map) {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(map));
}

export function todayKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addHabit(name, frequency = 'Daily') {
  const habits = getHabits();
  const id = self.crypto?.randomUUID ? self.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const habit = { id, name, frequency, createdAt: new Date().toISOString() };
  habits.push(habit);
  saveHabits(habits);
  return habit;
}

export function markCompleted(habitId, date = new Date()) {
  const key = todayKey(date);
  const completions = getCompletions();
  const set = new Set(completions[key] || []);
  set.add(habitId);
  completions[key] = Array.from(set);
  saveCompletions(completions);
  return completions[key];
}

export function isHabitCompletedOn(habitId, date) {
  const key = todayKey(date);
  const completions = getCompletions();
  return (completions[key] || []).includes(habitId);
}

export function completionsForDate(date) {
  const key = todayKey(date);
  const completions = getCompletions();
  return completions[key] || [];
}

export function allCompletionDates() {
  const c = getCompletions();
  return Object.keys(c).sort();
}

export function streakForHabit(habitId) {
  // Count consecutive days ending today with completion
  let streak = 0;
  const completions = getCompletions();
  let d = new Date();
  while (true) {
    const key = todayKey(d);
    const arr = completions[key] || [];
    if (arr.includes(habitId)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function bestPerformingHabit() {
  const habits = getHabits();
  const completions = getCompletions();
  const counts = {};
  Object.values(completions).forEach(list => {
    list.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });
  let best = null;
  let max = -1;
  habits.forEach(h => {
    const c = counts[h.id] || 0;
    if (c > max) {
      max = c;
      best = h;
    }
  });
  return best ? { habit: best, count: max } : null;
}

export function consistencyScore() {
  // percentage of days in last 14 days with at least one completion
  const days = 14;
  let completedDays = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (completionsForDate(d).length > 0) completedDays += 1;
  }
  return Math.round((completedDays / days) * 100);
}
