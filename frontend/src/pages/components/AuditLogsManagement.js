import React, { useState, useEffect } from 'react';
import { exportToCSV, printPDF } from '../../utils/exportUtils';
import { Search, Filter, Download, Printer, Shield, RefreshCw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const AuditLogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, resourceFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 15,
        search,
        action: actionFilter,
        resource: resourceFilter,
      });

      const res = await fetch(`/api/audit-logs?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotalLogs(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCSV = () => {
    const formatted = logs.map(l => ({
      Timestamp: new Date(l.createdAt).toLocaleString(),
      User: l.userName,
      Role: l.userRole,
      Action: l.action,
      Resource: l.resource,
      Details: l.details,
      IPAddress: l.ipAddress
    }));
    exportToCSV(formatted, `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    const cols = [
      { header: 'Timestamp', key: 'time' },
      { header: 'User', key: 'user' },
      { header: 'Role', key: 'role' },
      { header: 'Action', key: 'action' },
      { header: 'Resource', key: 'resource' },
      { header: 'Details', key: 'details' },
    ];
    const formatted = logs.map(l => ({
      time: new Date(l.createdAt).toLocaleString(),
      user: l.userName,
      role: l.userRole,
      action: l.action,
      resource: l.resource,
      details: l.details
    }));
    printPDF('System Audit Logs', cols, formatted);
  };

  return (
    <div style={{ padding: '24px', background: '#FAF6F0', minHeight: '100vh' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '50px',
                background: '#ffffff',
                color: '#0C4A86',
                border: '1px solid #BFDBFE',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0C4A86', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={22} color="#0C4A86" /> Audit Logs & Security History
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: '#6B5B54', margin: '4px 0 0' }}>Track all system actions, user operations, and data changes.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#0C4A86', cursor: 'pointer' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0C4A86', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#ffffff', cursor: 'pointer' }}>
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8C7F79' }} />
            <input
              type="text"
              placeholder="Search user, action, resource, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '9px 16px', background: '#6B5B54', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Search</button>
        </form>

        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', outline: 'none', color: '#0C4A86' }}>
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="EXPORT">EXPORT</option>
        </select>

        <select value={resourceFilter} onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', outline: 'none', color: '#0C4A86' }}>
          <option value="">All Resources</option>
          <option value="Student">Student</option>
          <option value="Employee">Employee</option>
          <option value="Fee">Fee</option>
          <option value="Exam">Exam</option>
          <option value="Notice">Notice</option>
          <option value="Meeting MOM">Meeting MOM</option>
        </select>

        <button onClick={fetchLogs} style={{ padding: '9px', background: '#FAF6F0', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer' }} title="Refresh">
          <RefreshCw size={16} color="#0C4A86" />
        </button>
      </div>

      {/* Logs Table */}
      <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#FAF6F0', borderBottom: '1px solid #BFDBFE', color: '#0C4A86', fontWeight: '700' }}>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px' }}>User</th>
              <th style={{ padding: '12px 16px' }}>Role</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
              <th style={{ padding: '12px 16px' }}>Resource</th>
              <th style={{ padding: '12px 16px' }}>Details</th>
              <th style={{ padding: '12px 16px' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '30px', textCenter: 'center', color: '#6B5B54' }}>Loading audit logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6B5B54' }}>No audit logs recorded matching criteria.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #FAF6F0' }}>
                <td style={{ padding: '12px 16px', color: '#6B5B54', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0C4A86' }}>{log.userName || 'Anonymous'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#FAF6F0', color: '#0C4A86', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', border: '1px solid #BFDBFE' }}>
                    {log.userRole}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                    background: log.action === 'CREATE' ? '#dcfce7' : log.action === 'DELETE' ? '#fee2e2' : log.action === 'UPDATE' ? '#e0f2fe' : '#FAF6F0',
                    color: log.action === 'CREATE' ? '#15803d' : log.action === 'DELETE' ? '#b91c1c' : log.action === 'UPDATE' ? '#0369a1' : '#0C4A86'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0C4A86' }}>{log.resource}</td>
                <td style={{ padding: '12px 16px', color: '#6B5B54', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                  {log.details}
                </td>
                <td style={{ padding: '12px 16px', color: '#6B5B54', fontSize: '12px' }}>{log.ipAddress || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAF6F0' }}>
          <span style={{ fontSize: '13px', color: '#6B5B54' }}>Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalLogs} total entries)</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #BFDBFE', borderRadius: '6px', background: '#fff', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'default' : 'pointer', color: '#0C4A86' }}>
              <ChevronLeft size={14} /> Previous
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #BFDBFE', borderRadius: '6px', background: '#fff', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'default' : 'pointer', color: '#0C4A86' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsManagement;
