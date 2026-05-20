'use client';

import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginAsOfficer = () => {
    setUser({
    id: 'emp1',
    name: 'John Smith',
    email: 'john@safety.com',
    role: 'OFFICER',
    department: 'Operations',
    designation: 'Safety Officer',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    });
  };  

  const loginAsAdmin = () => {
    setUser({
    id: 'emp2',
    name: 'Adnan Rafiq',
    email: 'adnan@safety.com',
    role: 'ADMIN',
    department: 'HSE',
    designation: 'HSE Manager',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginAsOfficer, loginAsAdmin, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
