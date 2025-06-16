
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Schedule from '../components/Schedule';
import Assignments from '../components/Assignments';
import Courses from '../components/Courses';
import Grades from '../components/Grades';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-music-50 to-music-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-music-600 mx-auto"></div>
          <p className="mt-4 text-music-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'schedule':
        return <Schedule />;
      case 'assignments':
        return <Assignments />;
      case 'grades':
        return <Grades />;
      case 'courses':
        return <Courses />;
      case 'users':
        return <div className="text-center py-8">Раздел "Пользователи" в разработке</div>;
      case 'departments':
        return <div className="text-center py-8">Раздел "Отделения" в разработке</div>;
      case 'statistics':
        return <div className="text-center py-8">Раздел "Статистика" в разработке</div>;
      case 'students':
        return <div className="text-center py-8">Раздел "Ученики" в разработке</div>;
      case 'reports':
        return <div className="text-center py-8">Раздел "Отчеты" в разработке</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
