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
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import MultiRoleMessagingSystem from '../../components/common/MultiRoleMessagingSystem';
import { studentService, feeService, marksService, attendanceService } from '../../services/api';
import { assignedTeacherClasses } from '../../services/schoolDataStore';

const mockChildrenList = [
  {
    _id: 's1',
    userId: { _id: 'u1', firstName: 'Ramesh', lastName: 'Kumar' },
    name: 'Ramesh Kumar',
    grade: '9',
    section: 'A',
    rollNumber: '09',
    admissionNo: 'ADM-2026-0914',
    classTeacher: 'Ramesh Sharma',
    dob: '2012-08-05'
  },
  {
    _id: 's2',
    userId: { _id: 'u2', firstName: 'Anjali', lastName: 'Kumar' },
    name: 'Anjali Kumar',
    grade: '6',
    section: 'B',
    rollNumber: '14',
    admissionNo: 'ADM-2026-0612',
    classTeacher: 'Sunita Verma',
    dob: '2015-03-12'
  }
];

const ParentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(mockChildrenList);
  const [selectedStudentId, setSelectedStudentId] = useState('s1');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchParentDashboard = async () => {
      const userIdentifier = user?.userId || user?.id || user?._id;
      if (!userIdentifier) return;

      try {
        setLoading(true);
        const studentResponse = await studentService.getByParent();
        if (studentResponse.data && studentResponse.data.length > 0) {
          setStudents(studentResponse.data);
          const firstId = studentResponse.data[0]._id || studentResponse.data[0].userId?._id;
          setSelectedStudentId(firstId);
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
          onSelectStudent={setSelectedStudentId}
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
                    onSelectStudent={setSelectedStudentId}
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
                    onSelectStudent={setSelectedStudentId}
                    stats={stats}
                  />
                }
              />
              <Route path="child" element={<ParentStudentProfile students={students} selectedStudentId={selectedStudentId} />} />
              <Route path="student-overview" element={<ParentStudentProfile students={students} selectedStudentId={selectedStudentId} />} />
              <Route path="attendance" element={<ParentAttendance selectedStudentId={selectedStudentId} />} />
              <Route path="homework" element={<ParentHomework selectedStudentId={selectedStudentId} />} />
              <Route path="assignments" element={<ParentAssignments selectedStudentId={selectedStudentId} />} />
              <Route path="study-notes" element={<ParentStudyNotes selectedStudentId={selectedStudentId} />} />
              <Route path="timetable" element={<ParentTimetable selectedStudentId={selectedStudentId} />} />
              <Route path="exams" element={<ParentExams selectedStudentId={selectedStudentId} />} />
              <Route path="results" element={<ParentResults selectedStudentId={selectedStudentId} />} />
              <Route path="activities" element={<StudentActivities />} />
              <Route path="classroom-activities" element={<ParentClassroomActivities selectedStudentId={selectedStudentId} />} />
              <Route
                path="communication"
                element={
                  <MultiRoleMessagingSystem
                    currentUserRole="Parent"
                    currentUserName={`${user?.firstName || 'Priya'} ${user?.lastName || 'Sharma'} (Parent)`}
                  />
                }
              />
              <Route path="notifications" element={<ParentNotifications />} />
              <Route path="fees" element={<ParentFees selectedStudentId={selectedStudentId} />} />
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
