
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Schedule as ScheduleType, Course } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock } from 'lucide-react';

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    courseId: '',
    day: '',
    time: '',
    duration: 45,
    room: ''
  });

  useEffect(() => {
    loadSchedules();
    loadCourses();
  }, []);

  const loadSchedules = () => {
    let userSchedules: ScheduleType[] = [];
    
    if (user?.role === 'student' && user.year) {
      userSchedules = dataService.getSchedulesByYear(user.year);
    } else if (user?.role === 'teacher') {
      const teacherCourses = dataService.getCoursesByTeacher(user.id);
      userSchedules = dataService.getSchedules().filter(schedule => 
        teacherCourses.some(course => course.id === schedule.courseId)
      );
    } else {
      userSchedules = dataService.getSchedules();
    }
    
    setSchedules(userSchedules);
  };

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

  const handleAddSchedule = () => {
    if (!newSchedule.courseId || !newSchedule.day || !newSchedule.time || !newSchedule.room) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    const course = courses.find(c => c.id === newSchedule.courseId);
    if (!course) return;

    dataService.createSchedule({
      ...newSchedule,
      teacherId: user?.id || course.teacherId,
      year: course.year,
      duration: Number(newSchedule.duration)
    });

    setNewSchedule({
      courseId: '',
      day: '',
      time: '',
      duration: 45,
      room: ''
    });
    setShowAddForm(false);
    loadSchedules();
    
    toast({
      title: "Успешно",
      description: "Занятие добавлено в расписание",
    });
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Неизвестный курс';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = dataService.getUserById(teacherId);
    return teacher ? `${teacher.name} ${teacher.surname}` : 'Неизвестный преподаватель';
  };

  const groupSchedulesByDay = () => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days.map(day => ({
      day,
      lessons: schedules
        .filter(schedule => schedule.day === day)
        .sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const canAddSchedule = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Расписание</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'student' ? `Расписание для ${user.year} года обучения` : 'Управление расписанием'}
          </p>
        </div>
        
        {canAddSchedule && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700"
          >
            <Plus size={16} className="mr-2" />
            Добавить занятие
          </Button>
        )}
      </div>

      {showAddForm && canAddSchedule && (
        <Card className="border-music-200">
          <CardHeader>
            <CardTitle>Добавить занятие</CardTitle>
            <CardDescription>Заполните информацию о новом занятии</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Курс</Label>
                <Select value={newSchedule.courseId} onValueChange={(value) => 
                  setNewSchedule({...newSchedule, courseId: value})
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
                <Label htmlFor="day">День недели</Label>
                <Select value={newSchedule.day} onValueChange={(value) => 
                  setNewSchedule({...newSchedule, day: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите день" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Время</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Длительность (минуты)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) => setNewSchedule({...newSchedule, duration: Number(e.target.value)})}
                  min="30"
                  max="180"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="room">Аудитория</Label>
                <Input
                  id="room"
                  value={newSchedule.room}
                  onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
                  placeholder="Номер аудитории"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddSchedule}>
                Добавить
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groupSchedulesByDay().map(({ day, lessons }) => (
          <Card key={day} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar size={20} className="text-music-600" />
                <span>{day}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Занятий нет</p>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 bg-music-50 rounded-lg border border-music-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-music-900">
                            {getCourseName(lesson.courseId)}
                          </h4>
                          <p className="text-sm text-music-600 mt-1">
                            {getTeacherName(lesson.teacherId)}
                          </p>
                        </div>
                        <div className="text-right text-sm text-music-700">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{lesson.time}</span>
                          </div>
                          <div className="text-xs text-music-500">
                            {lesson.duration} мин, ауд. {lesson.room}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
