
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Grade, Course, User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Award, Calendar, TrendingUp } from 'lucide-react';

const Grades: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: '',
    courseId: '',
    value: 5,
    maxValue: 5,
    type: 'performance' as Grade['type'],
    description: ''
  });

  useEffect(() => {
    loadGrades();
    loadCourses();
    loadStudents();
  }, []);

  const loadGrades = () => {
    let userGrades: Grade[] = [];
    
    if (user?.role === 'student') {
      userGrades = dataService.getGradesByStudent(user.id);
    } else {
      userGrades = dataService.getGrades();
    }
    
    setGrades(userGrades);
  };

  const loadCourses = () => {
    let userCourses: Course[] = [];
    
    if (user?.role === 'teacher') {
      userCourses = dataService.getCoursesByTeacher(user.id);
    } else if (user?.role === 'student' && user.year) {
      userCourses = dataService.getCoursesByYear(user.year);
    } else {
      userCourses = dataService.getCourses();
    }
    
    setCourses(userCourses);
  };

  const loadStudents = () => {
    const allUsers = dataService.getUsers();
    const studentUsers = allUsers.filter(u => u.role === 'student');
    setStudents(studentUsers);
  };

  const handleAddGrade = () => {
    if (!newGrade.studentId || !newGrade.courseId || !newGrade.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.id === newGrade.studentId);
    if (!student) return;

    dataService.createGrade({
      ...newGrade,
      teacherId: user?.id || '',
      date: new Date().toISOString(),
      year: student.year || 1
    });

    setNewGrade({
      studentId: '',
      courseId: '',
      value: 5,
      maxValue: 5,
      type: 'performance',
      description: ''
    });
    setShowAddForm(false);
    loadGrades();
    
    toast({
      title: "Успешно",
      description: "Оценка выставлена",
    });
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId) || dataService.getCourses().find(c => c.id === courseId);
    return course?.name || 'Неизвестный курс';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId) || dataService.getUserById(studentId);
    return student ? `${student.name} ${student.surname}` : 'Неизвестный ученик';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = dataService.getUserById(teacherId);
    return teacher ? `${teacher.name} ${teacher.surname}` : 'Неизвестный преподаватель';
  };

  const getGradeTypeLabel = (type: Grade['type']) => {
    const types = {
      homework: 'Домашнее задание',
      test: 'Контрольная работа',
      exam: 'Экзамен',
      performance: 'Успеваемость'
    };
    return types[type];
  };

  const getGradeColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + (grade.value / grade.maxValue) * 5, 0);
    return (total / grades.length).toFixed(1);
  };

  const canAddGrade = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Оценки</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'student' ? `Ваши оценки (средний балл: ${calculateAverage()})` : 'Управление оценками'}
          </p>
        </div>
        
        {canAddGrade && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700"
          >
            <Plus size={16} className="mr-2" />
            Выставить оценку
          </Button>
        )}
      </div>

      {showAddForm && canAddGrade && (
        <Card className="border-music-200">
          <CardHeader>
            <CardTitle>Выставить оценку</CardTitle>
            <CardDescription>Оцените работу ученика</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Ученик</Label>
                <Select value={newGrade.studentId} onValueChange={(value) => 
                  setNewGrade({...newGrade, studentId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ученика" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} {student.surname} ({student.year} год)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Курс</Label>
                <Select value={newGrade.courseId} onValueChange={(value) => 
                  setNewGrade({...newGrade, courseId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите курс" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.year} год)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Тип оценки</Label>
                <Select value={newGrade.type} onValueChange={(value: Grade['type']) => 
                  setNewGrade({...newGrade, type: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Успеваемость</SelectItem>
                    <SelectItem value="homework">Домашнее задание</SelectItem>
                    <SelectItem value="test">Контрольная работа</SelectItem>
                    <SelectItem value="exam">Экзамен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Оценка</Label>
                <div className="flex space-x-2">
                  <Input
                    id="value"
                    type="number"
                    value={newGrade.value}
                    onChange={(e) => setNewGrade({...newGrade, value: Number(e.target.value)})}
                    min="1"
                    max={newGrade.maxValue}
                  />
                  <span className="flex items-center text-sm text-gray-500">из</span>
                  <Input
                    type="number"
                    value={newGrade.maxValue}
                    onChange={(e) => setNewGrade({...newGrade, maxValue: Number(e.target.value)})}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Комментарий</Label>
                <Textarea
                  id="description"
                  value={newGrade.description}
                  onChange={(e) => setNewGrade({...newGrade, description: e.target.value})}
                  placeholder="Комментарий к оценке"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddGrade}>
                Выставить
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {grades.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Оценок не найдено
          </div>
        ) : (
          grades.map((grade) => (
            <Card key={grade.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award size={20} className="text-music-600" />
                    <span>{getCourseName(grade.courseId)}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.value, grade.maxValue)}`}>
                    {grade.value}/{grade.maxValue}
                  </div>
                </CardTitle>
                <CardDescription>
                  {getGradeTypeLabel(grade.type)} • {user?.role === 'student' ? getTeacherName(grade.teacherId) : getStudentName(grade.studentId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{grade.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-music-600">
                    <Calendar size={16} />
                    <span>{new Date(grade.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-music-600">
                    <TrendingUp size={16} />
                    <span>Процент: {Math.round((grade.value / grade.maxValue) * 100)}%</span>
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

export default Grades;
