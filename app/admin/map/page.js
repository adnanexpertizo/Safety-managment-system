'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';

export default function IncidentsMapPage() {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Static Incidents Data
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
      department: "HSE", 
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

  // Filtered Data
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const sevMatch = severityFilter === 'All' || inc.severity === severityFilter;
      const deptMatch = departmentFilter === 'All' || inc.department === departmentFilter;
      return sevMatch && deptMatch;
    });
  }, [incidents, severityFilter, departmentFilter]);

  const getSeverityColor = (severity) => {
    if (severity === 'High') return 'bg-red-500 text-white';
    if (severity === 'Medium') return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-white';
  };

  const getBadgeColor = (severity) => {
    if (severity === 'High') return 'bg-red-100 text-red-700 border border-red-200';
    if (severity === 'Medium') return 'bg-orange-100 text-orange-700 border border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Incidents Map</h1>
          <p className="text-gray-500 mt-1">Geospatial safety intelligence and incident visualization</p>
        </div>

        {/* Filters */}
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
              { value: 'HSE', label: 'HSE' },
            ]}
            value={departmentFilter}
            onChange={setDepartmentFilter}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Map Section */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">Live Incidents Map</h2>
            <p className="text-sm text-gray-500">Click on pins to view details</p>
          </div>

          <div className="relative h-[380px] md:h-[520px] bg-gray-100 border border-gray-200 overflow-hidden">
            
            {/* Placeholder Map Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Simulated Map Pins */}
            {filteredIncidents.map((inc, index) => (
              <div
                key={inc.id}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform ${getSeverityColor(inc.severity)}`}
                style={{
                  left: `${25 + (index % 3) * 18}%`,
                  top: `${20 + Math.floor(index / 3) * 25}%`,
                }}
                title={inc.title}
              >
                !
              </div>
            ))}

            {/* Map Overlay Info */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs shadow">
              {filteredIncidents.length} incidents shown
            </div>
          </div>
        </div>

        {/* Incidents List Sidebar */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              Recent Incidents <span className="text-gray-400 text-sm font-normal">({filteredIncidents.length})</span>
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No incidents match your filters
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm md:text-base leading-tight group-hover:text-blue-600 transition">
                        {inc.title}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1.5">
                        {inc.location}
                      </p>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getBadgeColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                    <span className="font-medium">{inc.department}</span>
                    <span>{inc.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}