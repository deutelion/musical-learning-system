
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Инициализируем данные при первом запуске
    dataService.initializeData();
    
    // Проверяем, есть ли сохраненный пользователь
    const currentUser = dataService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const loggedUser = dataService.login(email, password);
    if (loggedUser) {
      setUser(loggedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    dataService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
