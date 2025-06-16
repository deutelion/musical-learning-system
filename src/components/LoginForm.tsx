
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в систему!",
        });
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный email или пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе в систему",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Директор', email: 'director@music-school.ru', password: 'director123' },
    { role: 'Администратор', email: 'admin@music-school.ru', password: 'admin123' },
    { role: 'Преподаватель', email: 'teacher@music-school.ru', password: 'teacher123' },
    { role: 'Ученик', email: 'student@music-school.ru', password: 'student123' },
  ];

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-music-50 to-music-100 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-music-900 mb-2">🎵 Музыкальная Школа</h1>
          <p className="text-music-600">Система управления обучением</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-music-800">Вход в систему</CardTitle>
            <CardDescription className="text-center">
              Введите ваши учетные данные для входа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите ваш email"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-music-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите ваш пароль"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-music-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-music-500 to-music-600 hover:from-music-600 hover:to-music-700 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm text-music-800">Демо-доступы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-music-50 hover:bg-music-100 transition-colors">
                <div className="text-sm">
                  <div className="font-medium text-music-800">{cred.role}</div>
                  <div className="text-music-600 text-xs">{cred.email}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickLogin(cred.email, cred.password)}
                  className="text-xs border-music-300 text-music-700 hover:bg-music-100"
                >
                  Быстрый вход
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
