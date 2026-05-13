'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPin, Filter, AlertTriangle, Clock } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';
import { getLocalReports } from '@/lib/localStorage';

// ─── Severity helpers ─────────────────────────────────────────────────────────
const SEV_CONFIG = {
  high:   { pin: 'bg-red-500 shadow-red-200',   badge: 'bg-red-100 text-red-700 border border-red-200',   dot: 'bg-red-500'   },
  medium: { pin: 'bg-amber-500 shadow-amber-200', badge: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  low:    { pin: 'bg-emerald-500 shadow-emerald-200', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
};

const getConfig = (sev) => SEV_CONFIG[(sev || '').toLowerCase()] || SEV_CONFIG.low;

// ─── Static seed positions (offset-based, no real map lib) ───────────────────
const POSITIONS = [
  { x: '18%', y: '22%' }, { x: '38%', y: '35%' }, { x: '55%', y: '20%' },
  { x: '70%', y: '45%' }, { x: '28%', y: '58%' }, { x: '48%', y: '65%' },
  { x: '62%', y: '30%' }, { x: '15%', y: '68%' }, { x: '80%', y: '22%' },
  { x: '42%', y: '50%' },
];

// ─── Grid-map background dots pattern ────────────────────────────────────────
const MAP_GRID = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23cbd5e1' opacity='0.5'/%3E%3C/svg%3E")`;

export default function IncidentsMapPage() {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [dynamicIncidents, setDynamicIncidents] = useState([]);

  // Load real reports from localStorage and merge with static seeds
  useEffect(() => {
    const reports = getLocalReports();
    const mapped = reports.map((r, i) => ({
      id: r.id,
      title: r.description?.slice(0, 60) + (r.description?.length > 60 ? '…' : '') || 'Report',
      location: r.location || 'Unknown location',
      severity: r.severity || 'medium',
      type: r.type || 'incident',
      department: r.assignedDesignation || '—',
      date: r.dateOfIncident?.split('T')[0] || r.createdAt?.split('T')[0] || '—',
      status: r.status || 'open',
      pos: POSITIONS[i % POSITIONS.length],
    }));

    // Fallback static incidents if no real data
    if (mapped.length === 0) {
      setDynamicIncidents([
        { id: 1, title: 'Electrical short circuit near Panel B', location: 'Warehouse Zone A', severity: 'high', type: 'incident', department: 'Electrical', date: '2026-05-02', status: 'open', pos: POSITIONS[0] },
        { id: 2, title: 'Oil leak from hydraulic press', location: 'Production Hall Line 3', severity: 'medium', type: 'hazard', department: 'Mechanical', date: '2026-05-01', status: 'in-progress', pos: POSITIONS[1] },
        { id: 3, title: 'Slippery floor near entrance', location: 'Main Gate Area', severity: 'low', type: 'near_miss', department: 'HSE', date: '2026-04-30', status: 'resolved', pos: POSITIONS[2] },
        { id: 4, title: 'Faulty scaffolding on Site B', location: 'Site B - Construction', severity: 'high', type: 'incident', department: 'Mechanical', date: '2026-05-03', status: 'open', pos: POSITIONS[3] },
        { id: 5, title: 'Overheating transformer', location: 'Substation Area', severity: 'high', type: 'incident', department: 'Electrical', date: '2026-05-02', status: 'open', pos: POSITIONS[4] },
      ]);
    } else {
      setDynamicIncidents(mapped);
    }
  }, []);

  const filtered = useMemo(() => {
    return dynamicIncidents.filter(inc => {
      const sevOk = severityFilter === 'All' || (inc.severity || '').toLowerCase() === severityFilter.toLowerCase();
      const typeOk = typeFilter === 'All' || inc.type === typeFilter;
      return sevOk && typeOk;
    });
  }, [dynamicIncidents, severityFilter, typeFilter]);

  const counts = {
    high: filtered.filter(i => (i.severity || '').toLowerCase() === 'high').length,
    medium: filtered.filter(i => (i.severity || '').toLowerCase() === 'medium').length,
    low: filtered.filter(i => (i.severity || '').toLowerCase() === 'low').length,
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={20} className="text-slate-600" /> Incidents Map
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Geospatial safety intelligence & incident visualization</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="min-w-[130px]">
            <CustomSelect
              value={severityFilter}
              onChange={setSeverityFilter}
              options={[{ value: 'All', label: 'All Severities' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]}
              placeholder="Severity"
            />
          </div>
          <div className="min-w-[130px]">
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[{ value: 'All', label: 'All Types' }, { value: 'incident', label: 'Incident' }, { value: 'near_miss', label: 'Near Miss' }, { value: 'hazard', label: 'Hazard' }]}
              placeholder="Type"
            />
          </div>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High', val: counts.high, color: 'text-red-600', bg: 'bg-red-50 border-red-100', dot: 'bg-red-500' },
          { label: 'Medium', val: counts.medium, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', dot: 'bg-amber-500' },
          { label: 'Low', val: counts.low, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 ${s.bg}`}>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
            <div>
              <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{s.label} Severity</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Pseudo-Map */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Live Incidents Map</p>
              <p className="text-xs text-gray-400">Click pins to view details</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {filtered.length} shown
            </span>
          </div>

          <div
            className="relative overflow-hidden"
            style={{ height: 'clamp(300px, 50vw, 500px)', backgroundImage: MAP_GRID, backgroundColor: '#f8fafc' }}
          >
            {/* Decorative grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              {[0, 25, 50, 75, 100].map(p => (
                <g key={p}>
                  <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#94a3b8" strokeWidth="1" />
                </g>
              ))}
            </svg>

            {/* "Facility zones" decorative */}
            <div className="absolute" style={{ left: '10%', top: '15%', width: '35%', height: '40%' }}>
              <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-end justify-end p-2 opacity-60">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">Zone A</span>
              </div>
            </div>
            <div className="absolute" style={{ left: '50%', top: '30%', width: '38%', height: '45%' }}>
              <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-end justify-end p-2 opacity-60">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">Zone B</span>
              </div>
            </div>

            {/* Incident pins */}
            {filtered.map((inc) => {
              const cfg = getConfig(inc.severity);
              const isSel = selected?.id === inc.id;
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelected(isSel ? null : inc)}
                  className="absolute flex flex-col items-center group focus:outline-none"
                  style={{ left: inc.pos.x, top: inc.pos.y, transform: 'translate(-50%, -100%)' }}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black
                    shadow-lg ${cfg.pin}
                    transition-all duration-200
                    ${isSel ? 'scale-125 ring-3 ring-white ring-offset-1' : 'hover:scale-110'}
                  `}>
                    !
                  </div>
                  <div className="w-1 h-2 bg-gray-400 rounded-b" />

                  {/* Hover tooltip */}
                  {isSel && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-48 text-left z-10">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{inc.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{inc.location}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${cfg.badge}`}>{inc.severity}</span>
                        <span className="text-[10px] text-gray-400">{inc.date}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2 text-gray-300">
                  <MapPin size={32} className="mx-auto" />
                  <p className="text-sm font-medium">No incidents match filters</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
            {[['bg-red-500', 'High'], ['bg-amber-500', 'Medium'], ['bg-emerald-500', 'Low']].map(([cls, lbl]) => (
              <div key={lbl} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${cls}`} />
                <span className="text-[10px] text-gray-500 font-medium">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
            <p className="text-sm font-bold text-gray-800">
              Incidents <span className="text-gray-400 font-normal text-xs">({filtered.length})</span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-300 space-y-2">
                <AlertTriangle size={28} />
                <p className="text-xs">No incidents match your filters</p>
              </div>
            ) : (
              filtered.map((inc) => {
                const cfg = getConfig(inc.severity);
                const isSel = selected?.id === inc.id;
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelected(isSel ? null : inc)}
                    className={`w-full text-left border rounded-xl p-3.5 transition-all duration-150 ${
                      isSel
                        ? 'border-slate-400 bg-slate-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">{inc.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{inc.location}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${cfg.badge}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-500 font-medium capitalize">{inc.type?.replace('_', ' ')}</span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={9} /> {inc.date}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}