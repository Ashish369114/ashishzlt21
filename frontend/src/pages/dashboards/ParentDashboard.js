import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ParentSidebar from '../../components/dashboard/ParentSidebar';
import ParentNavbar from '../../components/dashboard/ParentNavbar';
import ParentHomePage from './ParentHomePage';
import ParentStudentProfile from '../components/ParentStudentProfile';
import ParentAttendance from '../components/ParentAttendance';
import ParentHomework from '../components/ParentHomework';
import ParentAssignments from '../components/ParentAssignments';
import ParentStudyNotes from '../components/ParentStudyNotes';
import ParentTimetable from '../components/ParentTimetable';
import ParentExams from '../components/ParentExams';
import ParentResults from '../components/ParentResults';
import ParentClassroomActivities from '../components/ParentClassroomActivities';
import ParentNotifications from '../components/ParentNotifications';
import ParentFees from '../components/ParentFees';
import ParentSettingsPage from '../components/ParentSettingsPage';
import StudentActivities from '../components/StudentActivities';
import MultiRoleMessagingSystem from '../../components/common/MultiRoleMessagingSystem';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import { studentService } from '../../services/api';

const mockChildrenList = [
  {
    _id: 's1',
    userId: { _id: 'u1', firstName: 'Ramesh', lastName: 'Kumar' },
    name: 'Ramesh Kumar',
    grade: '5',
    section: 'A',
    rollNumber: '05',
    admissionNo: 'ADM-2026-0512',
    classTeacher: 'Ramesh Sharma',
    dob: '2016-08-05'
  },
  {
    _id: 's2',
    userId: { _id: 'u2', firstName: 'Anjali', lastName: 'Kumar' },
    name: 'Anjali Kumar',
    grade: '8',
    section: 'B',
    rollNumber: '14',
    admissionNo: 'ADM-2026-0814',
    classTeacher: 'Sunita Verma',
    dob: '2013-03-12'
  }
];

const ParentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(mockChildrenList);
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    return localStorage.getItem('parent_selected_student_id') || 's1';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    localStorage.setItem('parent_selected_student_id', id);
  };

  useEffect(() => {
    const fetchParentDashboard = async () => {
      const userIdentifier = user?.userId || user?.id || user?._id;
      if (!userIdentifier) return;

      try {
        setLoading(true);
        const studentResponse = await studentService.getByParent();
        if (studentResponse.data && studentResponse.data.length > 0) {
          const list = studentResponse.data.length >= 2
            ? studentResponse.data
            : [...studentResponse.data, mockChildrenList[1]];
          setStudents(list);
          const savedId = localStorage.getItem('parent_selected_student_id');
          const validSaved = list.some(
            (st) => (st._id || st.userId?._id || st.userId) === savedId
          );
          if (!validSaved) {
            const firstId = list[0]._id || list[0].userId?._id;
            setSelectedStudentId(firstId);
            localStorage.setItem('parent_selected_student_id', firstId);
          }
        }
      } catch (error) {
        console.warn('Backend API connection unavailable, using local student store data:', error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParentDashboard();
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const activeStudent = students.find(
    (s) => (s._id || s.userId?._id || s.userId) === selectedStudentId
  ) || students[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 1. Left Sidebar Navigation */}
      <ParentSidebar
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex flex-col lg:pl-72">
        {/* Top Navbar */}
        <ParentNavbar
          user={user}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          unreadCount={3}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              Loading Parent Portal Data...
            </div>
          ) : (
            <Routes>
              <Route
                index
                element={
                  <ParentHomePage
                    user={user}
                    students={students}
                    selectedStudentId={selectedStudentId}
                    onSelectStudent={handleSelectStudent}
                    stats={stats}
                  />
                }
              />
              <Route
                path="overview"
                element={
                  <ParentHomePage
                    user={user}
                    students={students}
                    selectedStudentId={selectedStudentId}
                    onSelectStudent={handleSelectStudent}
                    stats={stats}
                  />
                }
              />
              <Route path="child" element={<ParentStudentProfile user={user} students={students} selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="student-overview" element={<ParentStudentProfile user={user} students={students} selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="attendance" element={<ParentAttendance selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="homework" element={<ParentHomework selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="assignments" element={<ParentAssignments selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="study-notes" element={<ParentStudyNotes selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="timetable" element={<ParentTimetable selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="exams" element={<ParentExams selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="results" element={<ParentResults selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="activities" element={<StudentActivities isParentView={true} selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="classroom-activities" element={<ParentClassroomActivities selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route
                path="communication"
                element={
                  <MultiRoleMessagingSystem
                    currentUserRole="Parent"
                    currentUserName={`${user?.firstName || 'Priya'} ${user?.lastName || 'Sharma'} (Parent)`}
                    selectedStudentId={selectedStudentId}
                    student={activeStudent}
                  />
                }
              />
              <Route path="notifications" element={<ParentNotifications selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="fees" element={<ParentFees selectedStudentId={selectedStudentId} student={activeStudent} />} />
              <Route path="calendar" element={<InteractiveGoogleCalendar />} />
              <Route path="settings" element={<ParentSettingsPage user={user} onLogout={handleLogout} />} />
              <Route
                path="*"
                element={
                  <ParentHomePage
                    user={user}
                    students={students}
                    selectedStudentId={selectedStudentId}
                    onSelectStudent={setSelectedStudentId}
                    stats={stats}
                  />
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
