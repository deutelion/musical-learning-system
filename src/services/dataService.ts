
import { User, Course, Assignment, Grade, Schedule, Department } from '../types';

const STORAGE_KEYS = {
  USERS: 'lms_users',
  COURSES: 'lms_courses',
  ASSIGNMENTS: 'lms_assignments',
  GRADES: 'lms_grades',
  SCHEDULES: 'lms_schedules',
  DEPARTMENTS: 'lms_departments',
  CURRENT_USER: 'lms_current_user'
};

class DataService {
  // Инициализация данных при первом запуске
  initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.createInitialData();
    }
  }

  private createInitialData() {
    // Создаем начальных пользователей
    const initialUsers: User[] = [
      {
        id: '1',
        email: 'director@music-school.ru',
        password: 'director123',
        role: 'director',
        name: 'Анна',
        surname: 'Петрова',
        phone: '+7 (999) 123-45-67',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'admin@music-school.ru',
        password: 'admin123',
        role: 'admin',
        name: 'Михаил',
        surname: 'Сидоров',
        phone: '+7 (999) 234-56-78',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'teacher@music-school.ru',
        password: 'teacher123',
        role: 'teacher',
        name: 'Елена',
        surname: 'Иванова',
        department: 'piano',
        phone: '+7 (999) 345-67-89',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        email: 'student@music-school.ru',
        password: 'student123',
        role: 'student',
        name: 'Дмитрий',
        surname: 'Козлов',
        year: 3,
        department: 'piano',
        phone: '+7 (999) 456-78-90',
        createdAt: new Date().toISOString()
      }
    ];

    const initialDepartments: Department[] = [
      {
        id: '1',
        name: 'Фортепиано',
        description: 'Отделение фортепиано',
        headTeacherId: '3'
      },
      {
        id: '2',
        name: 'Духовые инструменты',
        description: 'Отделение духовых инструментов'
      },
      {
        id: '3',
        name: 'Ударные инструменты',
        description: 'Отделение ударных инструментов'
      }
    ];

    const initialCourses: Course[] = [
      {
        id: '1',
        name: 'Специальность фортепиано',
        department: 'piano',
        year: 3,
        description: 'Основной курс игры на фортепиано для 3 года обучения',
        teacherId: '3'
      },
      {
        id: '2',
        name: 'Сольфеджио',
        department: 'theory',
        year: 3,
        description: 'Теоретический курс сольфеджио',
        teacherId: '3'
      }
    ];

    this.saveData(STORAGE_KEYS.USERS, initialUsers);
    this.saveData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    this.saveData(STORAGE_KEYS.COURSES, initialCourses);
    this.saveData(STORAGE_KEYS.ASSIGNMENTS, []);
    this.saveData(STORAGE_KEYS.GRADES, []);
    this.saveData(STORAGE_KEYS.SCHEDULES, []);
  }

  // Общие методы для работы с данными
  private saveData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Методы для работы с пользователями
  getUsers(): User[] {
    return this.loadData<User>(STORAGE_KEYS.USERS);
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveData(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveData(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    return null;
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length !== users.length) {
      this.saveData(STORAGE_KEYS.USERS, filteredUsers);
      return true;
    }
    return false;
  }

  // Методы авторизации
  login(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  }

  // Методы для работы с курсами
  getCourses(): Course[] {
    return this.loadData<Course>(STORAGE_KEYS.COURSES);
  }

  getCoursesByYear(year: number): Course[] {
    return this.getCourses().filter(course => course.year === year);
  }

  getCoursesByTeacher(teacherId: string): Course[] {
    return this.getCourses().filter(course => course.teacherId === teacherId);
  }

  createCourse(course: Omit<Course, 'id'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...course,
      id: Date.now().toString()
    };
    courses.push(newCourse);
    this.saveData(STORAGE_KEYS.COURSES, courses);
    return newCourse;
  }

  // Методы для работы с заданиями
  getAssignments(): Assignment[] {
    return this.loadData<Assignment>(STORAGE_KEYS.ASSIGNMENTS);
  }

  getAssignmentsByStudent(studentId: string): Assignment[] {
    return this.getAssignments().filter(assignment => 
      assignment.studentId === studentId || !assignment.studentId
    );
  }

  getAssignmentsByTeacher(teacherId: string): Assignment[] {
    return this.getAssignments().filter(assignment => assignment.teacherId === teacherId);
  }

  createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
    const assignments = this.getAssignments();
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    this.saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAssignment;
  }

  updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(assignment => assignment.id === id);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updates };
      this.saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
      return assignments[index];
    }
    return null;
  }

  // Методы для работы с оценками
  getGrades(): Grade[] {
    return this.loadData<Grade>(STORAGE_KEYS.GRADES);
  }

  getGradesByStudent(studentId: string): Grade[] {
    return this.getGrades().filter(grade => grade.studentId === studentId);
  }

  createGrade(grade: Omit<Grade, 'id'>): Grade {
    const grades = this.getGrades();
    const newGrade: Grade = {
      ...grade,
      id: Date.now().toString()
    };
    grades.push(newGrade);
    this.saveData(STORAGE_KEYS.GRADES, grades);
    return newGrade;
  }

  // Методы для работы с расписанием
  getSchedules(): Schedule[] {
    return this.loadData<Schedule>(STORAGE_KEYS.SCHEDULES);
  }

  getSchedulesByYear(year: number): Schedule[] {
    return this.getSchedules().filter(schedule => schedule.year === year);
  }

  createSchedule(schedule: Omit<Schedule, 'id'>): Schedule {
    const schedules = this.getSchedules();
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString()
    };
    schedules.push(newSchedule);
    this.saveData(STORAGE_KEYS.SCHEDULES, schedules);
    return newSchedule;
  }

  // Методы для работы с отделениями
  getDepartments(): Department[] {
    return this.loadData<Department>(STORAGE_KEYS.DEPARTMENTS);
  }

  createDepartment(department: Omit<Department, 'id'>): Department {
    const departments = this.getDepartments();
    const newDepartment: Department = {
      ...department,
      id: Date.now().toString()
    };
    departments.push(newDepartment);
    this.saveData(STORAGE_KEYS.DEPARTMENTS, departments);
    return newDepartment;
  }
}

export const dataService = new DataService();
