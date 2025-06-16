
export type UserRole = 'student' | 'teacher' | 'admin' | 'director';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  surname: string;
  year?: number; // для студентов (1-7)
  department?: string;
  phone?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  department: string;
  year: number;
  description: string;
  teacherId: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  teacherId: string;
  studentId?: string;
  year: number;
  dueDate: string;
  completed: boolean;
  submissionDate?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  value: number;
  maxValue: number;
  type: 'homework' | 'test' | 'exam' | 'performance';
  description: string;
  date: string;
  year: number;
}

export interface Schedule {
  id: string;
  courseId: string;
  teacherId: string;
  day: string;
  time: string;
  duration: number;
  year: number;
  room: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headTeacherId?: string;
}
