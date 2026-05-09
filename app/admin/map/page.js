'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';

export default function IncidentsMapPage() {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // -------------------------
  // STATIC DATA
  // -------------------------
  const incidents = useMemo(() => [
    { 
      id: 1, 
      title: "Electrical short circuit near Panel B", 
      location: "Warehouse - Zone A", 
      severity: "High", 
      department: "Electrical", 
      date: "2026-05-02",
      lat: 24.8607, 
      lng: 67.0011 
    },
    { 
      id: 2, 
      title: "Oil leak from hydraulic press", 
      location: "Production Hall - Line 3", 
      severity: "Medium", 
      department: "Mechanical", 
      date: "2026-05-01",
      lat: 24.8650, 
      lng: 67.0050 
    },
    { 
      id: 3, 
      title: "Slippery floor near entrance", 
      location: "Main Gate Area", 
      severity: "Low", 
      department: "Electrical", 
      date: "2026-04-30",
      lat: 24.8580, 
      lng: 66.9950 
    },
    { 
      id: 4, 
      title: "Faulty scaffolding on Site B", 
      location: "Site B - Construction", 
      severity: "High", 
      department: "Mechanical", 
      date: "2026-05-03",
      lat: 24.8700, 
      lng: 67.0100 
    },
    { 
      id: 5, 
      title: "Overheating transformer", 
      location: "Substation Area", 
      severity: "High", 
      department: "Electrical", 
      date: "2026-05-02",
      lat: 24.8625, 
      lng: 67.0025 
    },
  ], []);

  // -------------------------
  // FILTER LOGIC
  // -------------------------
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const sevMatch = severityFilter === 'All' || inc.severity === severityFilter;
      const deptMatch = departmentFilter === 'All' || inc.department === departmentFilter;
      return sevMatch && deptMatch;
    });
  }, [incidents, severityFilter, departmentFilter]);

  // -------------------------
  // HELPER: COLOR
  // -------------------------
  const getSeverityColor = (severity) => {
    if (severity === 'High') return 'bg-red-500';
    if (severity === 'Medium') return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getBadgeColor = (severity) => {
    if (severity === 'High') return 'bg-red-100 text-red-700';
    if (severity === 'Medium') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Incidents Map</h1>
          <p className="text-gray-500 text-sm md:text-base">
            Geographical view of safety incidents
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <CustomSelect
            options={[
              { value: 'All', label: 'All Severities' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
            value={severityFilter}
            onChange={setSeverityFilter}
          />

          <CustomSelect
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Mechanical', label: 'Mechanical' },
            ]}
            value={departmentFilter}
            onChange={setDepartmentFilter}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* MAP */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="font-semibold mb-4">Incidents Location Map</h2>

          <div className="relative h-[350px] md:h-[500px] bg-gray-100 border border-dashed border-gray-300 rounded-xl overflow-hidden">

            {/* MAP PLACEHOLDER */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="font-medium text-gray-600">Map Integration Ready</p>
              <p className="text-xs text-gray-400 mt-1">
                Google Maps / Leaflet can be plugged here
              </p>
            </div>

            {/* PINS */}
            {filteredIncidents.map((inc, index) => (
              <div
                key={inc.id}
                className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${getSeverityColor(inc.severity)}`}
                style={{
                  left: `${20 + (index * 12)}%`,
                  top: `${25 + (index * 10)}%`,
                }}
                title={inc.title}
              >
                !
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="font-semibold mb-4">
            Recent Incidents ({filteredIncidents.length})
          </h2>

          <div className="space-y-3 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-1">

            {filteredIncidents.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">
                No incidents found
              </p>
            )}

            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow transition"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm md:text-base">
                      {inc.title}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {inc.location}
                    </p>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getBadgeColor(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>{inc.department}</span>
                  <span>{inc.date}</span>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}