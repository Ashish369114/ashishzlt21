import React from 'react';

const StudentDownloadsEnhanced = () => {
  const handleDownload = (type) => {
    const content = [`Download: ${type}`, '====================', `This is your ${type.toLowerCase()} download.`];
    const blob = new Blob([content.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📥 Downloads</h2>
      </div>
      <div className="card-content">
        <p>Download notes, study material, and certificates for your courses.</p>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {['Notes', 'Study Material', 'Certificates'].map((item) => (
              <tr key={item}>
                <td>{item}</td>
                <td>{`Download ${item.toLowerCase()} for your current subjects.`}</td>
                <td>
                  <button className="btn btn-small btn-primary" onClick={() => handleDownload(item)}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDownloadsEnhanced;
