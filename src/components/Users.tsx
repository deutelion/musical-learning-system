import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { User, UserRole } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Plus, User as UserIcon, Mail, Phone, Calendar } from 'lucide-react';

const Users: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
    phone: '',
    year: 1,
    department: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = dataService.getUsers();
    setUsers(allUsers);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.surname || !newUser.email || !newUser.password) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    // Проверяем, что email уникален
    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      toast({
        title: "Ошибка",
        description: "Пользователь с таким email уже существует",
        variant: "destructive",
      });
      return;
    }

    const userData: any = {
      name: newUser.name,
      surname: newUser.surname,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      phone: newUser.phone || undefined
    };

    // Добавляем дополнительные поля для студентов
    if (newUser.role === 'student') {
      userData.year = newUser.year;
      if (newUser.department) {
        userData.department = newUser.department;
      }
    }

    // Добавляем отделение для преподавателей
    if (newUser.role === 'teacher' && newUser.department) {
      userData.department = newUser.department;
    }

    dataService.createUser(userData);

    setNewUser({
      name: '',
      surname: '',
      email: '',
      password: '',
      role: 'student',
      phone: '',
      year: 1,
      department: ''
    });
    setShowAddForm(false);
    loadUsers();
    
    toast({
      title: "Успешно",
      description: "Пользователь создан",
    });
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'student': return 'Ученик';
      case 'teacher': return 'Преподаватель';
      case 'admin': return 'Администратор';
      case 'director': return 'Директор';
      default: return role;
    }
  };

  const canManageUsers = user?.role === 'admin' || user?.role === 'director';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 mt-2">Управление пользователями системы</p>
        </div>
        
        {canManageUsers && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700"
          >
            <Plus size={16} className="mr-2" />
            Добавить пользователя
          </Button>
        )}
      </div>

      {showAddForm && canManageUsers && (
        <Card className="border-music-200">
          <CardHeader>
            <CardTitle>Добавить пользователя</CardTitle>
            <CardDescription>Создайте нового пользователя</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Имя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname">Фамилия</Label>
                <Input
                  id="surname"
                  value={newUser.surname}
                  onChange={(e) => setNewUser({...newUser, surname: e.target.value})}
                  placeholder="Фамилия"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Пароль"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => 
                  setNewUser({...newUser, role: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Ученик</SelectItem>
                    <SelectItem value="teacher">Преподаватель</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                    <SelectItem value="director">Директор</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              {newUser.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="year">Год обучения</Label>
                  <Select value={newUser.year.toString()} onValueChange={(value) => 
                    setNewUser({...newUser, year: Number(value)})
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
              )}

              {(newUser.role === 'student' || newUser.role === 'teacher') && (
                <div className="space-y-2">
                  <Label htmlFor="department">Отделение</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    placeholder="Например: piano"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddUser}>
                Создать
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>Всего пользователей: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Дополнительно</TableHead>
                <TableHead>Дата создания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <UserIcon size={16} className="text-music-600" />
                      <span className="font-medium">{userItem.name} {userItem.surname}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm">{userItem.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-music-100 text-music-800">
                      {getRoleLabel(userItem.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {userItem.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-sm">{userItem.phone}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {userItem.role === 'student' && userItem.year && (
                        <div>{userItem.year} год</div>
                      )}
                      {userItem.department && (
                        <div>{userItem.department}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm">
                        {new Date(userItem.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
