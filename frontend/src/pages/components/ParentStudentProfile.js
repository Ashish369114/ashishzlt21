import React from 'react';

const ParentStudentProfile = ({ students = [] }) => {
  const formatParentInfo = (parentId) => {
    if (!parentId) return null;
    if (typeof parentId === 'string') return parentId;
    const name = `${parentId.firstName || ''} ${parentId.lastName || ''}`.trim();
    return name || parentId.userId || parentId.email || parentId.phone || null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>👩‍🎓 Linked Student Profile</h2>
      </div>

      {students.length === 0 ? (
        <div className="card-content">No linked children found for this parent.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll Number</th>
                <th>Parent ID</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const parentInfo = formatParentInfo(student.parentId) || formatParentInfo(student.userId?.parentId);
                return (
                  <tr key={student._id || student.id || student.userId?._id || student.userId}>
                    <td>{student.userId?.firstName} {student.userId?.lastName}</td>
                    <td>{student.class?.grade || student.class}</td>
                    <td>{student.class?.section || '-'}</td>
                    <td>{student.rollNumber || student.userId?.rollNumber || '-'}</td>
                    <td>{parentInfo || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentStudentProfile;
