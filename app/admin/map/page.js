'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/CustomSelect';

export default function IncidentsMapPage() {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Static Dummy Data
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

  const filteredIncidents = incidents.filter(inc => {
    const sevMatch = severityFilter === 'All' || inc.severity === severityFilter;
    const deptMatch = departmentFilter === 'All' || inc.department === departmentFilter;
    return sevMatch && deptMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Incidents Map</h1>
          <p className="text-gray-500">Geographical view of safety incidents</p>
        </div>

        <div className="flex gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3 card p-6">
          <h2 className="font-semibold mb-4">Incidents Location Map</h2>
          
          {/* Placeholder Map */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-[480px] flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-xl font-medium text-gray-600">Interactive Map View</p>
              <p className="text-gray-500 mt-2">Google Maps / Leaflet integration can be added later</p>
            </div>

            {/* Fake Map Pins */}
            {filteredIncidents.map((inc, index) => (
              <div 
                key={inc.id}
                className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg
                  ${inc.severity === 'High' ? 'bg-red-500' : 
                    inc.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                style={{
                  left: `${40 + (index * 12)}%`,
                  top: `${30 + (index * 8)}%`,
                }}
              >
                !
              </div>
            ))}
          </div>
        </div>

        {/* List Sidebar */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold mb-4">Recent Incidents ({filteredIncidents.length})</h2>
          
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredIncidents.map(inc => (
              <div key={inc.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{inc.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{inc.location}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${inc.severity === 'High' ? 'bg-red-100 text-red-700' : 
                      inc.severity === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
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