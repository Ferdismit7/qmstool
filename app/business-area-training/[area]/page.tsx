"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiUsers, FiPlus } from 'react-icons/fi';



const months = [
  { name: 'Jan', weeks: 4 },
  { name: 'Feb', weeks: 4 },
  { name: 'Mar', weeks: 4 },
];

export default function BusinessAreaProfilePage() {
  const params = useParams();
  const area = decodeURIComponent(params.area as string);

  // State for training sessions from the database
  const [sessions, setSessions] = useState<{
    id?: number;
    session: string;
    session_date: string;
    remarks: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    session: '',
    session_date: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch sessions for this business area on mount
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/training-sessions?business_area=${encodeURIComponent(area)}`);
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();
        setSessions(data);
      } catch {
        setError('Could not load training sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [area]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/training-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_area: area,
          session: form.session,
          session_date: form.session_date,
          remarks: form.remarks,
        }),
      });
      if (!res.ok) throw new Error('Failed to save session');
      const newSession = await res.json();
      setSessions(prev => [...prev, newSession]);
      setForm({ session: '', session_date: '', remarks: '' });
      setShowForm(false);
    } catch {
      setError('Could not save training session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiUsers className="text-brand-primary" size={32} />
        <h1 className="text-3xl font-bold text-brand-white">{area} Training Profile</h1>
      </div>
      <p className="text-brand-gray2 mb-8">Track ISO:9001 training sessions and progress for the {area} business area.</p>
      <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-lg border border-brand-dark/20 shadow-md mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FiUsers className="text-brand-primary" size={24} />
          <h2 className="text-lg font-semibold text-brand-white">{area}</h2>
        </div>
        {/* Ruler-style progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-brand-gray2 mb-1">
            <span>Training Progress</span>
            <span>{sessions.length}/30 Sessions</span>
          </div>
          <div className="relative w-full h-8 flex items-center">
            {/* Ruler background */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-gray-700 rounded-full"></div>
            {/* Progress fill */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-brand-primary rounded-full transition-all"
              style={{ width: `${(sessions.length / 30) * 100}%` }}
            ></div>
            {/* Month and week ticks */}
            <div className="relative w-full flex justify-between z-10">
              {months.map((month, mIdx) => (
                <div key={month.name} className="flex-1 flex flex-col items-center">
                  <span className="text-xs text-brand-gray2 mb-1">{month.name}</span>
                  <div className="flex w-full justify-between">
                    {[...Array(month.weeks)].map((_, wIdx) => (
                      <span
                        key={wIdx}
                        className="block w-0.5 h-3 bg-brand-gray2 mx-0.5 rounded-full"
                        style={{ opacity: wIdx === 0 && mIdx !== 0 ? 0 : 1 }}
                      ></span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Add Training Session Button */}
        <button
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors mb-4"
          onClick={() => setShowForm(v => !v)}
        >
          <FiPlus /> Add Training Session
        </button>
        {/* Add Training Session Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-900/80 p-4 rounded-lg border border-brand-dark/30">
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">Training Session</label>
              <select
                name="session"
                value={form.session}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Select Session</option>
                {Array.from({ length: 30 }, (_, i) => `Session ${i + 1}`).map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">Date of Session</label>
              <input
                type="date"
                name="session_date"
                value={form.session_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray2 mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 rounded-lg border border-brand-gray1 bg-brand-gray1/50 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Session'}
              </button>
            </div>
          </form>
        )}
        {/* List of added sessions */}
        {loading ? (
          <div className="text-brand-gray2">Loading sessions...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : sessions.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-brand-white font-semibold mb-2 text-base">Added Sessions</h3>
            <ul className="space-y-2">
              {sessions.map((s, idx) => (
                <li key={s.id || idx} className="bg-brand-gray1/40 rounded p-3 text-brand-white">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{s.session}</span>
                    <span className="text-brand-gray2">{s.session_date}</span>
                  </div>
                  <div className="text-xs text-brand-gray2">{s.remarks}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-brand-gray2">No sessions added yet.</div>
        )}
      </div>
    </div>
  );
} 