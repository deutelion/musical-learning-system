
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Assignment, Course, User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseId: '',
    studentId: '',
    dueDate: ''
  });

  useEffect(() => {
    loadAssignments();
    loadCourses();
    loadStudents();
  }, []);

  const loadAssignments = () => {
    let userAssignments: Assignment[] = [];
    
    if (user?.role === 'student') {
      userAssignments = dataService.getAssignmentsByStudent(user.id);
    } else if (user?.role === 'teacher') {
      userAssignments = dataService.getAssignmentsByTeacher(user.id);
    } else {
      userAssignments = dataService.getAssignments();
    }
    
    setAssignments(userAssignments);
  };

  const loadCourses = () => {
    let userCourses: Course[] = [];
    
    if (user?.role === 'teacher') {
      userCourses = dataService.getCoursesByTeacher(user.id);
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

  const handleAddAssignment = () => {
    if (!newAssignment.title || !newAssignment.courseId || !newAssignment.dueDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const course = courses.find(c => c.id === newAssignment.courseId);
    if (!course) return;

    dataService.createAssignment({
      ...newAssignment,
      teacherId: user?.id || '',
      studentId: newAssignment.studentId || undefined,
      year: course.year,
      completed: false
    });

    setNewAssignment({
      title: '',
      description: '',
      courseId: '',
      studentId: '',
      dueDate: ''
    });
    setShowAddForm(false);
    loadAssignments();
    
    toast({
      title: "Успешно",
      description: "Задание создано",
    });
  };

  const handleToggleComplete = (assignmentId: string, completed: boolean) => {
    dataService.updateAssignment(assignmentId, {
      completed,
      submissionDate: completed ? new Date().toISOString() : undefined
    });
    loadAssignments();
    
    toast({
      title: "Успешно",
      description: completed ? "Задание выполнено" : "Задание отмечено как невыполненное",
    });
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId) || dataService.getCourses().find(c => c.id === courseId);
    return course?.name || 'Неизвестный курс';
  };

  const getStudentName = (studentId?: string) => {
    if (!studentId) return 'Все ученики';
    const student = students.find(s => s.id === studentId) || dataService.getUserById(studentId);
    return student ? `${student.name} ${student.surname}` : 'Неизвестный ученик';
  };

  const canAddAssignment = user?.role === 'teacher' || user?.role === 'admin';
  const canToggleComplete = user?.role === 'student';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Задания</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'student' ? 'Ваши задания' : 'Управление заданиями'}
          </p>
        </div>
        
        {canAddAssignment && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700"
          >
            <Plus size={16} className="mr-2" />
            Добавить задание
          </Button>
        )}
      </div>

      {showAddForm && canAddAssignment && (
        <Card className="border-music-200">
          <CardHeader>
            <CardTitle>Добавить задание</CardTitle>
            <CardDescription>Создайте новое задание для учеников</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название задания</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  placeholder="Например: Выучить гаммы"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Курс</Label>
                <Select value={newAssignment.courseId} onValueChange={(value) => 
                  setNewAssignment({...newAssignment, courseId: value})
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
                <Label htmlFor="student">Ученик (необязательно)</Label>
                <Select value={newAssignment.studentId} onValueChange={(value) => 
                  setNewAssignment({...newAssignment, studentId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Все ученики" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все ученики</SelectItem>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} {student.surname} ({student.year} год)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Срок выполнения</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  placeholder="Подробное описание задания"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddAssignment}>
                Создать
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Заданий не найдено
          </div>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className={`transition-all duration-200 hover:shadow-lg ${
              assignment.completed ? 'border-green-200 bg-green-50' : 'border-music-200'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen size={20} className="text-music-600" />
                    <span>{assignment.title}</span>
                  </div>
                  {assignment.completed ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <Clock size={20} className="text-orange-600" />
                  )}
                </CardTitle>
                <CardDescription>
                  {getCourseName(assignment.courseId)} • {getStudentName(assignment.studentId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{assignment.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-music-600">
                    <Calendar size={16} />
                    <span>Срок: {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                  {canToggleComplete && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignment-${assignment.id}`}
                        checked={assignment.completed}
                        onCheckedChange={(checked) => 
                          handleToggleComplete(assignment.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`assignment-${assignment.id}`}>
                        Выполнено
                      </Label>
                    </div>
                  )}
                  {assignment.completed && assignment.submissionDate && (
                    <p className="text-xs text-green-600">
                      Выполнено: {new Date(assignment.submissionDate).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Assignments;
