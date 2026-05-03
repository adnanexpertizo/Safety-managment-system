'use client';

import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginAsOfficer = () => {
    setUser({
      id: 'officer-001',
      name: 'Safety Officer',
      email: 'officer@safety.com',
      role: 'OFFICER',
      department: 'Operations',
      photo: null,
    });
  };

  const loginAsAdmin = () => {
    setUser({
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@safety.com',
      role: 'ADMIN',
      department: 'Safety Management',
      photo: null,
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
