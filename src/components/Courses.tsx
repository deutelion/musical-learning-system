
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Course, User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Book, User as UserIcon } from 'lucide-react';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    department: '',
    year: 1,
    description: '',
    teacherId: ''
  });

  useEffect(() => {
    loadCourses();
    loadTeachers();
  }, []);

  const loadCourses = () => {
    let userCourses: Course[] = [];
    
    if (user?.role === 'student' && user.year) {
      userCourses = dataService.getCoursesByYear(user.year);
    } else if (user?.role === 'teacher') {
      userCourses = dataService.getCoursesByTeacher(user.id);
    } else {
      userCourses = dataService.getCourses();
    }
    
    setCourses(userCourses);
  };

  const loadTeachers = () => {
    const allUsers = dataService.getUsers();
    const teacherUsers = allUsers.filter(u => u.role === 'teacher');
    setTeachers(teacherUsers);
  };

  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.department || !newCourse.teacherId) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    dataService.createCourse({
      ...newCourse,
      year: Number(newCourse.year)
    });

    setNewCourse({
      name: '',
      department: '',
      year: 1,
      description: '',
      teacherId: ''
    });
    setShowAddForm(false);
    loadCourses();
    
    toast({
      title: "Успешно",
      description: "Курс создан",
    });
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.name} ${teacher.surname}` : 'Неизвестный преподаватель';
  };

  const canAddCourse = user?.role === 'admin' || user?.role === 'director';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Курсы</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'student' ? `Курсы для ${user.year} года обучения` : 'Управление курсами'}
          </p>
        </div>
        
        {canAddCourse && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700"
          >
            <Plus size={16} className="mr-2" />
            Добавить курс
          </Button>
        )}
      </div>

      {showAddForm && canAddCourse && (
        <Card className="border-music-200">
          <CardHeader>
            <CardTitle>Добавить курс</CardTitle>
            <CardDescription>Создайте новый курс</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название курса</Label>
                <Input
                  id="name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  placeholder="Например: Специальность фортепиано"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Отделение</Label>
                <Input
                  id="department"
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                  placeholder="Например: piano"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Год обучения</Label>
                <Select value={newCourse.year.toString()} onValueChange={(value) => 
                  setNewCourse({...newCourse, year: Number(value)})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year} год</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Преподаватель</Label>
                <Select value={newCourse.teacherId} onValueChange={(value) => 
                  setNewCourse({...newCourse, teacherId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите преподавателя" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} {teacher.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Описание курса"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddCourse}>
                Создать
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Курсов не найдено
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book size={20} className="text-music-600" />
                  <span>{course.name}</span>
                </CardTitle>
                <CardDescription>
                  {course.year} год обучения • {course.department}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-music-600">
                    <UserIcon size={16} />
                    <span>{getTeacherName(course.teacherId)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
