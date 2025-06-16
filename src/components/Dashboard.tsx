
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Calendar, Book, User, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getDashboardData = () => {
    switch (user?.role) {
      case 'student':
        return getStudentDashboard();
      case 'teacher':
        return getTeacherDashboard();
      case 'admin':
        return getAdminDashboard();
      case 'director':
        return getDirectorDashboard();
      default:
        return [];
    }
  };

  const getStudentDashboard = () => {
    const assignments = dataService.getAssignmentsByStudent(user!.id);
    const grades = dataService.getGradesByStudent(user!.id);
    const courses = dataService.getCoursesByYear(user!.year || 1);
    
    return [
      {
        title: 'Активные задания',
        value: assignments.filter(a => !a.completed).length,
        description: 'заданий к выполнению',
        icon: Book,
        color: 'bg-blue-500'
      },
      {
        title: 'Курсы',
        value: courses.length,
        description: 'курсов в этом году',
        icon: Book,
        color: 'bg-green-500'
      },
      {
        title: 'Оценки',
        value: grades.length,
        description: 'оценок получено',
        icon: User,
        color: 'bg-purple-500'
      },
      {
        title: 'Год обучения',
        value: user?.year || 1,
        description: 'из 7 лет программы',
        icon: Calendar,
        color: 'bg-orange-500'
      }
    ];
  };

  const getTeacherDashboard = () => {
    const courses = dataService.getCoursesByTeacher(user!.id);
    const assignments = dataService.getAssignmentsByTeacher(user!.id);
    const students = dataService.getUsers().filter(u => u.role === 'student');
    
    return [
      {
        title: 'Мои курсы',
        value: courses.length,
        description: 'курсов ведется',
        icon: Book,
        color: 'bg-blue-500'
      },
      {
        title: 'Задания',
        value: assignments.length,
        description: 'заданий создано',
        icon: Book,
        color: 'bg-green-500'
      },
      {
        title: 'Ученики',
        value: students.length,
        description: 'учеников в школе',
        icon: User,
        color: 'bg-purple-500'
      }
    ];
  };

  const getAdminDashboard = () => {
    const users = dataService.getUsers();
    const courses = dataService.getCourses();
    const departments = dataService.getDepartments();
    
    return [
      {
        title: 'Пользователи',
        value: users.length,
        description: 'пользователей в системе',
        icon: User,
        color: 'bg-blue-500'
      },
      {
        title: 'Курсы',
        value: courses.length,
        description: 'курсов создано',
        icon: Book,
        color: 'bg-green-500'
      },
      {
        title: 'Отделения',
        value: departments.length,
        description: 'отделений работает',
        icon: Settings,
        color: 'bg-purple-500'
      }
    ];
  };

  const getDirectorDashboard = () => {
    const users = dataService.getUsers();
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const grades = dataService.getGrades();
    
    const avgGrade = grades.length > 0 
      ? (grades.reduce((sum, g) => sum + (g.value / g.maxValue * 5), 0) / grades.length).toFixed(1)
      : '0';
    
    return [
      {
        title: 'Ученики',
        value: students.length,
        description: 'учеников обучается',
        icon: User,
        color: 'bg-blue-500'
      },
      {
        title: 'Преподаватели',
        value: teachers.length,
        description: 'преподавателей работает',
        icon: User,
        color: 'bg-green-500'
      },
      {
        title: 'Средний балл',
        value: avgGrade,
        description: 'общая успеваемость',
        icon: Book,
        color: 'bg-purple-500'
      },
      {
        title: 'Всего оценок',
        value: grades.length,
        description: 'оценок выставлено',
        icon: Calendar,
        color: 'bg-orange-500'
      }
    ];
  };

  const dashboardData = getDashboardData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Добро пожаловать, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {getRoleDescription(user?.role)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${item.color} text-white`}>
                  <Icon size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {user?.role === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Ваш прогресс</CardTitle>
            <CardDescription>
              Год обучения: {user.year} из 7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-music-500 to-music-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${((user.year || 1) / 7) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Прогресс: {Math.round(((user.year || 1) / 7) * 100)}%
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getRoleDescription = (role?: string) => {
  switch (role) {
    case 'student': return 'Панель ученика - здесь вы можете видеть свои задания, оценки и расписание';
    case 'teacher': return 'Панель преподавателя - управляйте заданиями и оценками ваших учеников';
    case 'admin': return 'Панель администратора - управление пользователями, курсами и расписанием';
    case 'director': return 'Панель директора - общая статистика и аналитика школы';
    default: return '';
  }
};

export default Dashboard;
