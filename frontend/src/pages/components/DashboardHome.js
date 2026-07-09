import React from 'react';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import { getPlanDisplayName, getPlanModules } from '../../utils/planModules';

const DashboardHome = ({ stats }) => {
  const userId = localStorage.getItem('userId');
  const schoolId = localStorage.getItem('schoolId');
  const role = localStorage.getItem('role');
  const { notifications } = useRealtimeUpdates(userId, schoolId, role);
  const planName = localStorage.getItem('subscriptionPlan') || 'silver';
  const cards = [];

  const addCard = (label, value, formatter = (item) => item) => {
    cards.push({ label, value: formatter(value) });
  };

  if (stats?.totalStudents !== undefined) {
    addCard('Total Students', stats.totalStudents);
  }
  if (stats?.totalTeachers !== undefined) {
    addCard('Total Teachers', stats.totalTeachers);
  }
  if (stats?.totalClasses !== undefined) {
    addCard('Total Classes', stats.totalClasses);
  }
  if (stats?.totalParents !== undefined) {
    addCard('Total Parents', stats.totalParents);
  }
  if (stats?.totalMarks !== undefined) {
    addCard('Total Marks', stats.totalMarks);
  }
  if (stats?.attendanceRecords !== undefined) {
    addCard('Attendance Records', stats.attendanceRecords);
  }
  if (stats?.homeworkAssignments !== undefined) {
    addCard('Homework Assignments', stats.homeworkAssignments);
  }
  if (stats?.totalExams !== undefined) {
    addCard('Total Exams', stats.totalExams);
  }
  if (stats?.pendingFees !== undefined || stats?.pendingCount !== undefined || stats?.totalAmount !== undefined || stats?.totalFees !== undefined) {
    const feeValue = stats?.pendingFees ?? stats?.pendingCount ?? stats?.totalAmount ?? stats?.totalFees ?? 0;
    addCard('Pending Fees', feeValue, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }
  if (stats?.totalFees !== undefined && stats?.pendingFees === undefined && stats?.pendingCount === undefined && stats?.totalAmount === undefined) {
    addCard('Total Fees', stats.totalFees, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }
  if (stats?.todayCollection !== undefined) {
    addCard("Today's Collection", stats.todayCollection, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }
  if (stats?.monthlyCollection !== undefined) {
    addCard('Monthly Revenue', stats.monthlyCollection, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }
  if (stats?.totalExpenses !== undefined) {
    addCard('Total Expenses', stats.totalExpenses, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }
  if (stats?.netIncome !== undefined) {
    addCard('Net Income', stats.netIncome, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }

  if (cards.length === 0) {
    addCard('Total Students', 0);
    addCard('Total Teachers', 0);
    addCard('Total Classes', 0);
    addCard('Pending Fees', 0, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }

  const showAccountantLanding = stats?.todayCollection !== undefined || stats?.monthlyCollection !== undefined || stats?.totalExpenses !== undefined || stats?.netIncome !== undefined;

  return (
    <div>
      {showAccountantLanding && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h2>💼 Accountant Landing Summary</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Today's Collection</h3>
              <div className="value">₹{Number(stats.todayCollection || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <h3>Monthly Revenue</h3>
              <div className="value">₹{Number(stats.monthlyCollection || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <h3>Total Expenses</h3>
              <div className="value">₹{Number(stats.totalExpenses || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <h3>Net Income</h3>
              <div className="value">₹{Number(stats.netIncome || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <h3>{card.label}</h3>
            <div className="value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📊 Quick Overview</h2>
        </div>
        <p>Welcome to the School Management System. Use the navigation menu to access different modules.</p>
        <div style={{ marginTop: '12px' }}>
          <strong>Active Plan:</strong> {getPlanDisplayName(planName)}
        </div>
        <div style={{ marginTop: '10px' }}>
          <strong>Included Modules:</strong>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginTop: '8px' }}>
            {getPlanModules(planName).slice(0, 10).map((module) => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>🔔 Live Activity</h2>
          </div>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            {notifications.slice(0, 6).map((notification) => (
              <li key={notification.id}>
                <strong>{notification.title}</strong>: {notification.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats?.sectionSummary?.length ? (
        <div className="card">
          <div className="card-header">
            <h2>🔖 Grade and Section Assignments</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {stats.sectionSummary.map((section) => (
                  <tr key={`${section.grade}-${section.section}`}>
                    <td>{section.grade}</td>
                    <td>{section.section}</td>
                    <td>{section.teacher}</td>
                    <td>{section.studentCount}</td>
                    <td>{section.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {stats?.teacherSummary?.length ? (
        <div className="card">
          <div className="card-header">
            <h2>👩‍🏫 Teacher Assignment Summary</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Grades</th>
                  <th>Sections</th>
                  <th>Subjects</th>
                </tr>
              </thead>
              <tbody>
                {stats.teacherSummary.map((teacher) => (
                  <tr key={teacher.name}>
                    <td>{teacher.name}</td>
                    <td>{teacher.grades.length ? teacher.grades.join(', ') : '—'}</td>
                    <td>{teacher.sections.length ? teacher.sections.join(', ') : '—'}</td>
                    <td>{teacher.subjects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="card-header">
          <h2>🎯 Features</h2>
        </div>
        <ul style={{ lineHeight: '2', paddingLeft: '20px' }}>
          <li>✅ Student Management - Add, edit, delete and view student records</li>
          <li>✅ Teacher Management - Manage teacher information and assignments</li>
          <li>✅ Marks Management - Track student academic performance</li>
          <li>✅ Attendance Tracking - Monitor student attendance</li>
          <li>✅ Homework Assignment - Assign and track homework</li>
          <li>✅ Fee Management - Manage student fees and payments</li>
          <li>✅ Real-time Synchronization - Data updates across all dashboards</li>
          <li>✅ Role-based Access Control - Secure access for different user roles</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;
