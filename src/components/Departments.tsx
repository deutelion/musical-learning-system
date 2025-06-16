
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { Department, User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, User as UserIcon } from 'lucide-react';

const Departments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    headTeacherId: ''
  });

  useEffect(() => {
    loadDepartments();
    loadTeachers();
  }, []);

  const loadDepartments = () => {
    const allDepartments = dataService.getDepartments();
    setDepartments(allDepartments);
  };

  const loadTeachers = () => {
    const allUsers = dataService.getUsers();
    const teacherUsers = allUsers.filter(u => u.role === 'teacher');
    setTeachers(teacherUsers);
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    dataService.createDepartment({
      ...newDepartment,
      headTeacherId: newDepartment.headTeacherId || undefined
    });

    setNewDepartment({
      name: '',
      description: '',
      headTeacherId: ''
    });
    setShowAddForm(false);
    loadDepartments();
    
    toast({
      title: "Успешно",
      description: "Отделение создано",
    });
  };

  const getHeadTeacherName = (headTeacherId?: string) => {
    if (!headTeacherId) return 'Не назначен';
    const teacher = teachers.find(t => t.id === headTeacherId);
    return teacher ? `${teacher.name} ${teacher.surname}` : 'Неизвестный преподаватель';
  };

  const canManageDepartments = user?.role === 'admin' || user?.role === 'director';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Отделения</h1>
          <p className="text-gray-600 mt-2">Управление отделениями музыкальной школы</p>
        </div>
        
        {canManageDepartments && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700"
          >
            <Plus size={16} className="mr-2" />
            Добавить отделение
          </Button>
        )}
      </div>

      {showAddForm && canManageDepartments && (
        <Card className="border-music-200">
          <CardHeader>
            <CardTitle>Добавить отделение</CardTitle>
            <CardDescription>Создайте новое отделение</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название отделения</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  placeholder="Например: Фортепиано"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headTeacher">Заведующий отделением</Label>
                <Select value={newDepartment.headTeacherId} onValueChange={(value) => 
                  setNewDepartment({...newDepartment, headTeacherId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите преподавателя" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Не назначать</SelectItem>
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
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Описание отделения"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddDepartment}>
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
        {departments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Отделений не найдено
          </div>
        ) : (
          departments.map((department) => (
            <Card key={department.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 size={20} className="text-music-600" />
                  <span>{department.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{department.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-music-600">
                    <UserIcon size={16} />
                    <span>Заведующий: {getHeadTeacherName(department.headTeacherId)}</span>
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

export default Departments;
