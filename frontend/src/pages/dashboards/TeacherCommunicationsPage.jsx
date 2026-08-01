import React from 'react';
import MultiRoleMessagingSystem from '../../components/common/MultiRoleMessagingSystem';

const TeacherCommunicationsPage = ({ user }) => {
  const teacherName = `${user?.firstName || 'Ramesh'} ${user?.lastName || 'Sharma'}`.trim();

  return (
    <div className="space-y-6">
      <MultiRoleMessagingSystem currentUserRole="Teacher" currentUserName={teacherName} />
    </div>
  );
};

export default TeacherCommunicationsPage;
