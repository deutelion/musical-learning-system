
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Home, Calendar, Book, User, Settings } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Главная', icon: Home },
      { id: 'schedule', label: 'Расписание', icon: Calendar },
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...baseItems,
          { id: 'assignments', label: 'Задания', icon: Book },
          { id: 'grades', label: 'Оценки', icon: Book },
          { id: 'courses', label: 'Курсы', icon: Book },
        ];
      case 'teacher':
        return [
          ...baseItems,
          { id: 'assignments', label: 'Задания', icon: Book },
          { id: 'grades', label: 'Оценки', icon: Book },
          { id: 'students', label: 'Ученики', icon: User },
        ];
      case 'admin':
        return [
          ...baseItems,
          { id: 'users', label: 'Пользователи', icon: User },
          { id: 'courses', label: 'Курсы', icon: Book },
          { id: 'departments', label: 'Отделения', icon: Settings },
        ];
      case 'director':
        return [
          ...baseItems,
          { id: 'statistics', label: 'Статистика', icon: Settings },
          { id: 'users', label: 'Пользователи', icon: User },
          { id: 'reports', label: 'Отчеты', icon: Book },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-sm border-b border-music-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-music-800">🎵 LMS</h1>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        activeSection === item.id
                          ? 'bg-music-100 text-music-800'
                          : 'text-music-600 hover:text-music-800 hover:bg-music-50'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-music-600">
              <span className="font-medium">{user?.name} {user?.surname}</span>
              <span className="text-xs block">{getRoleLabel(user?.role)}</span>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-music-300 text-music-700 hover:bg-music-100"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div className="md:hidden bg-music-50 border-t border-music-200">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-colors ${
                  activeSection === item.id
                    ? 'bg-music-200 text-music-900'
                    : 'text-music-600 hover:text-music-800 hover:bg-music-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'student': return 'Ученик';
    case 'teacher': return 'Преподаватель';
    case 'admin': return 'Администратор';
    case 'director': return 'Директор';
    default: return '';
  }
};

export default Navigation;
