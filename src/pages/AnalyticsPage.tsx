import { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import TopBar from '../components/TopBar';
import { db, getAllCheckIns, getAllChecklistDays, type CheckIn, type ChecklistDay, type PracticeSession } from '../data/db';
import { CHECKLIST_TASKS } from '../data/checklist';

function dateStringDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatEntryDate(timestamp: number): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const TOTAL_TASKS = CHECKLIST_TASKS.length;

export default function AnalyticsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [days, setDays] = useState<ChecklistDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    Promise.all([getAllCheckIns(), getAllChecklistDays(), db.practiceSessions.toArray()]).then(([ci, cd, ps]) => {
      setSessions(ps);
      setCheckIns(ci);
      setDays(cd);
      setLoading(false);
    });
  }, []);

  const completionByDate = useMemo(() => {
    const map: Record<string, number> = {};
    days.forEach((d) => {
      map[d.date] = Math.round((d.completedTaskIds.length / TOTAL_TASKS) * 100);
    });
    return map;
  }, [days]);

  const chartData = useMemo(() => {
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) last7Days.push(dateStringDaysAgo(i));

    return last7Days.map((date) => {
      const dayCheckIns = checkIns.filter((c) => c.date === date);
      const avgAnxiety = dayCheckIns.length
        ? Math.round((dayCheckIns.reduce((sum, c) => sum + c.anxietyLevel, 0) / dayCheckIns.length) * 10) / 10
        : null;
      return {
        date,
        label: formatShortDate(date),
        day: new Date(date + 'T00:00').toLocaleDateString([], { weekday: 'narrow' }),
        completion: completionByDate[date] ?? 0,
        anxiety: avgAnxiety,
        present: Math.round(sessions.filter((p) => p.date === date).reduce((n, p) => n + p.durationSec, 0) / 6) / 10,
      };
    });
  }, [checkIns, completionByDate, sessions]);

  const summary = useMemo(() => {
    const stressDays = chartData.filter((d) => d.anxiety !== null);
    return {
      adherence: Math.round(chartData.reduce((n, d) => n + d.completion, 0) / chartData.length),
      stress: stressDays.length ? Math.round((stressDays.reduce((n, d) => n + (d.anxiety ?? 0), 0) / stressDays.length) * 10) / 10 : null,
      present: Math.round(chartData.reduce((n, d) => n + d.present, 0)),
    };
  }, [chartData]);

  if (loading) {
    return (
      <>
        <TopBar title="Progress" icon="monitoring" />
        <div className="page-content"><p style={{ color: 'var(--color-on-surface-variant)' }}>Loading your history\u2026</p></div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Progress" icon="monitoring" />
      <div className="page-content">

        {/* ── Week at a glance ── */}
        <section className="progress-stats animate-fade-up">
          <div className="progress-stat">
            <span className="progress-stat-value">{summary.adherence}%</span>
            <span className="progress-stat-label">Avg plan</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{summary.stress ?? '\u2013'}</span>
            <span className="progress-stat-label">Avg stress</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{summary.present}</span>
            <span className="progress-stat-label">Present min</span>
          </div>
        </section>

        {/* ── 7-day chart ── */}
        <section className="card progress-chart-card animate-fade-up">
          <div className="section-header" style={{ marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined">show_chart</span>
            <h3 className="section-title">7-Day Trend</h3>
          </div>
          <div className="progress-legend">
            <span><i style={{ background: 'var(--sage-200)' }} />Plan %</span>
            <span><i style={{ background: 'var(--color-secondary)' }} />Stress</span>
            <span><i style={{ background: 'var(--sage-400)' }} />Present min</span>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} />
                <YAxis yAxisId="left" domain={[0, 100]} ticks={[0, 50, 100]} width={30} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} ticks={[0, 5, 10]} width={22} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} />
                <Tooltip
                  labelFormatter={(_, p) => (p?.[0]?.payload?.label ?? '')}
                  contentStyle={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 13 }}
                />
                <Bar yAxisId="left" dataKey="completion" name="Plan %" fill="var(--sage-200)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="present" name="Present min" stroke="var(--sage-400)" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="anxiety" name="Stress (1-10)" stroke="var(--color-secondary)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">history</span>
            <h3 className="section-title">Your Journey</h3>
          </div>

          {checkIns.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <p>No check-ins yet. Log one from the Tools tab to start your timeline.</p>
            </div>
          ) : (
            <div className="progress-timeline">
              <div className="timeline-line" />
              {checkIns.map((entry, i) => {
                const color = entry.anxietyLevel <= 3 ? 'var(--color-primary)' : entry.anxietyLevel <= 6 ? 'var(--color-tertiary)' : 'var(--color-secondary)';
                const dayCompletion = completionByDate[entry.date] ?? 0;
                return (
                  <div key={entry.id} className="timeline-entry" style={{ animationDelay: `${i * 0.03}s` }}>
                    <div className="timeline-dot" style={{ background: color }} />
                    <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-card)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '18px' }}>{entry.moodIcon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{entry.mood} {'\u00b7'} {entry.anxietyLevel}/10</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-outline)' }}>
                            {formatEntryDate(entry.timestamp)}, {formatTime(entry.timestamp)}
                          </p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(82,100,66,0.08)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                          {dayCompletion}% plan
                        </span>
                      </div>
                      {entry.notes && (
                        <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', margin: 0 }}>
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
