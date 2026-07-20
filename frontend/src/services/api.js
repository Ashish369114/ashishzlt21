import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (stale/invalid token — e.g., after backend restart)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login without a full page reload loop
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (userId, password) => api.post('/auth/login', { userId, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  forgotPassword: (emailOrUserId) => api.post('/auth/forgot-password', emailOrUserId),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
};

export const studentService = {
  getAll: () => api.get('/students'),
  getByParent: () => api.get('/students/parent'),
  getById: (id) => api.get(`/students/${id}`),
  getByUserId: (userId) => api.get(`/students/user/${userId}`),
  add: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByClass: (classId) => api.get(`/students/class/${classId}`),
};

export const teacherService = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  getByUserId: (userId) => api.get(`/teachers/user/${userId}`),
  add: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  assignClass: (data) => api.post('/teachers/assign-class', data),
};

export const marksService = {
  getAll: () => api.get('/marks'),
  getByStudent: (studentId) => api.get(`/marks/student/${studentId}`),
  getByClass: (classId) => api.get(`/marks/class/${classId}`),
  add: (data) => api.post('/marks', data),
  update: (id, data) => api.put(`/marks/${id}`, data),
  delete: (id) => api.delete(`/marks/${id}`),
};

export const attendanceService = {
  getAll: () => api.get('/attendance'),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  getByClass: (classId) => api.get(`/attendance/class/${classId}`),
  mark: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const homeworkService = {
  getAll: () => api.get('/homework'),
  getByClass: (classId) => api.get(`/homework/class/${classId}`),
  getBySubject: (subjectId) => api.get(`/homework/subject/${subjectId}`),
  getByStudent: (studentId) => api.get(`/homework/student/${studentId}`),
  add: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
  submit: (id, data) => api.post(`/homework/${id}/submit`, data),
  review: (id, data) => api.put(`/homework/${id}/review`, data),
};

export const remarkService = {
  getAll: () => api.get('/remarks'),
  getByStudent: (studentId) => api.get(`/remarks/student/${studentId}`),
  getByClass: (classId) => api.get(`/remarks/class/${classId}`),
  add: (data) => api.post('/remarks', data),
  update: (id, data) => api.put(`/remarks/${id}`, data),
  delete: (id) => api.delete(`/remarks/${id}`),
};

export const examService = {
  getAll: () => api.get('/exams'),
  getById: (id) => api.get(`/exams/${id}`),
  getByClass: (classId) => api.get(`/exams/class/${classId}`),
  add: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  add: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const feeService = {
  getAll: () => api.get('/fees'),
  getByParent: () => api.get('/fees/parent'),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  getBySection: (classId) => api.get(`/fees/section/${classId}`),
  getPending: () => api.get('/fees/pending'),
  add: (data) => api.post('/fees', data),
  pay: (data) => api.post('/fees/pay', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`),
  deleteByStudent: (studentId) => api.delete(`/fees/student/${studentId}`),
};

export const expenseService = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  add: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getMonthlyReport: (year) => api.get(`/expenses/report/monthly?year=${year}`),
};

export const classService = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  assignTeacher: (data) => api.post('/classes/assign-teacher', data),
  getStats: () => api.get('/classes/stats/dashboard'),
  getSubjects: () => api.get('/classes/subjects'),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  add: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const employeeService = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  updateSalary: (id, data) => api.put(`/employees/${id}/salary`, data),
  getPayroll: (schoolId) => api.get(`/employees/school/${schoolId}/payroll`),
};

export const schoolService = {
  getAll: () => api.get('/schools'),
  add: (data) => api.post('/schools', data),
  update: (id, data) => api.put(`/schools/${id}`, data),
  delete: (id) => api.delete(`/schools/${id}`),
  upgradePlan: (data) => api.post('/schools/upgrade-plan', data),
};

export const libraryService = {
  getAll: () => api.get('/library'),
  add: (data) => api.post('/library', data),
  update: (id, data) => api.put(`/library/${id}`, data),
  borrow: (bookId, data) => api.post(`/library/${bookId}/borrow`, data),
  delete: (id) => api.delete(`/library/${id}`),
};

export const transportService = {
  getAll: () => api.get('/transport'),
  add: (data) => api.post('/transport', data),
  update: (id, data) => api.put(`/transport/${id}`, data),
  delete: (id) => api.delete(`/transport/${id}`),
};

export const concessionService = {
  getAll: () => api.get('/concessions'),
  getPending: () => api.get('/concessions/pending'),
  create: (data) => api.post('/concessions', data),
  approve: (id, remarks) => api.put(`/concessions/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.put(`/concessions/${id}/reject`, { remarks }),
};

export const subjectService = {
  getAll: () => api.get('/subjects'),
  add: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const leaveService = {
  getAll:     ()         => api.get('/leaves'),
  getPending: ()         => api.get('/leaves/pending'),
  submit:     (data)     => api.post('/leaves', data),
  approve:    (id, rem)  => api.put(`/leaves/${id}/approve`, { remarks: rem }),
  reject:     (id, rem)  => api.put(`/leaves/${id}/reject`, { remarks: rem }),
  remove:     (id)       => api.delete(`/leaves/${id}`),
};
const getLocalComplaints = () => {
  const data = localStorage.getItem('school_complaints');
  return data ? JSON.parse(data) : [];
};
const saveLocalComplaints = (complaints) => {
  localStorage.setItem('school_complaints', JSON.stringify(complaints));
};

export const complaintService = {
  getAll: async () => {
    return { data: getLocalComplaints() };
  },
  getByUser: async (userId) => {
    const all = getLocalComplaints();
    const userComplaints = all.filter(c => c.submittedByUserId === userId);
    return { data: userComplaints };
  },
  add: async (data) => {
    const all = getLocalComplaints();
    const newComplaint = {
      _id: 'comp_' + Date.now(),
      ...data,
      status: 'New',
      createdAt: new Date().toISOString(),
      principalNotes: '',
      history: [{ action: 'Created', date: new Date().toISOString() }]
    };
    all.push(newComplaint);
    saveLocalComplaints(all);
    return { data: newComplaint };
  },
  updateStatus: async (id, status) => {
    const all = getLocalComplaints();
    const idx = all.findIndex(c => c._id === id);
    if (idx !== -1) {
      all[idx].status = status;
      all[idx].history.push({ action: `Status changed to ${status}`, date: new Date().toISOString() });
      saveLocalComplaints(all);
      return { data: all[idx] };
    }
    throw new Error('Not found');
  },
  addNote: async (id, note) => {
    const all = getLocalComplaints();
    const idx = all.findIndex(c => c._id === id);
    if (idx !== -1) {
      all[idx].principalNotes = note;
      all[idx].history.push({ action: 'Principal Note added', date: new Date().toISOString() });
      saveLocalComplaints(all);
      return { data: all[idx] };
    }
    throw new Error('Not found');
  }
};

const getLocalStudentNotes = () => {
  const data = localStorage.getItem('school_student_notes');
  return data ? JSON.parse(data) : [];
};
const saveLocalStudentNotes = (notes) => {
  localStorage.setItem('school_student_notes', JSON.stringify(notes));
};

export const studentNotesService = {
  getAll: async () => {
    return { data: getLocalStudentNotes() };
  },
  getByStudent: async (studentId) => {
    const all = getLocalStudentNotes();
    let studentNotes = all.filter(n => n.studentId === studentId);
    
    // Auto-seed dummy data if empty for demonstration
    if (studentNotes.length === 0) {
      studentNotes = [
        {
          _id: 'dummy_note_1_' + Date.now(),
          studentId,
          category: 'Excellent Performance',
          subject: 'Mathematics',
          priority: 'Low',
          description: 'Consistently performing well in class tests and assignments. Keep up the good work!',
          visibleToParent: true,
          addedBy: 'Mr. Sharma',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'dummy_note_2_' + Date.now(),
          studentId,
          category: 'Behaviour Issue',
          subject: '',
          priority: 'Medium',
          description: 'Very talkative during lectures. Needs to focus more on the lesson.',
          visibleToParent: true,
          addedBy: 'Ms. Gupta',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      saveLocalStudentNotes([...all, ...studentNotes]);
    }
    
    return { data: studentNotes };
  },
  add: async (data) => {
    const all = getLocalStudentNotes();
    const newNote = {
      _id: 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      ...data,
      date: new Date().toISOString(),
    };
    all.push(newNote);
    
    // Remedial classes logic
    if (newNote.category === 'Weak in Subject' && newNote.subject) {
      const subjectNotes = all.filter(n => 
        n.studentId === newNote.studentId && 
        n.category === 'Weak in Subject' && 
        n.subject === newNote.subject
      );
      
      if (subjectNotes.length === 3) {
        // Auto flag
        const autoNote = {
          _id: 'note_' + Date.now() + '_auto',
          studentId: newNote.studentId,
          subject: newNote.subject,
          category: 'Needs Remedial Classes',
          priority: 'High',
          description: `SYSTEM AUTOMATED: Student has been flagged as weak in ${newNote.subject} 3 times. Remedial classes are highly recommended.`,
          addedBy: 'System Auto-Flag',
          visibleToParent: true,
          date: new Date().toISOString(),
        };
        all.push(autoNote);
      }
    }
    
    saveLocalStudentNotes(all);
    return { data: newNote };
  }
};

export const assignmentService = {
  getAll: () => api.get('/assignments'),
  add: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

export const activityService = {
  getAll: () => api.get('/activities'),
  add: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
};

export const messageService = {
  getAll: () => api.get('/messages'),
  getByUser: (userId) => api.get(`/messages/user/${userId}`),
  send: (data) => api.post('/messages', data),
};

export default api;
