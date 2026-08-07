import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, ShieldCheck, Server, Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const BackupRestoreManagement = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/system-admin/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSystemStatus(data.system);
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/system-admin/backup', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Backup failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Database backup downloaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to download backup' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a backup JSON file to restore' });
      return;
    }

    if (!window.confirm('WARNING: Restoring will import records from the backup file into your system. Continue?')) {
      return;
    }

    setRestoreLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fileText = await selectedFile.text();
      const backupJson = JSON.parse(fileText);

      const res = await fetch('/api/system-admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(backupJson)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setSelectedFile(null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Restore failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid JSON backup file or restore failed' });
    } finally {
      setRestoreLoading(false);
    }
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
              <Database size={22} color="#0C4A86" /> Backup & System Administration
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: '#6B5B54', margin: '4px 0 0' }}>Manage database backups, system restore, and configuration health.</p>
        </div>

        <button onClick={fetchSystemStatus} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#0C4A86', cursor: 'pointer' }}>
          <RefreshCw size={15} /> Refresh Status
        </button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', border: message.type === 'success' ? '1px solid #a7f3d0' : '1px solid #f87171', color: message.type === 'success' ? '#065f46' : '#b91c1c' }}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* System Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FAF6F0', color: '#0C4A86', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6B5B54', fontWeight: '700', textTransform: 'uppercase' }}>Database Engine</span>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0C4A86', margin: '2px 0 0', textTransform: 'capitalize' }}>
              {systemStatus?.dbDialect || 'SQLite / PostgreSQL'}
            </h4>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6B5B54', fontWeight: '700', textTransform: 'uppercase' }}>Database Status</span>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#15803d', margin: '2px 0 0' }}>Connected & Active</h4>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6B5B54', fontWeight: '700', textTransform: 'uppercase' }}>Server Uptime</span>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0C4A86', margin: '2px 0 0' }}>
              {systemStatus?.uptimeSeconds ? `${Math.floor(systemStatus.uptimeSeconds / 60)} mins` : 'Active'}
            </h4>
          </div>
        </div>
      </div>

      {/* Backup & Restore Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Backup Card */}
        <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#FAF6F0', color: '#0C4A86' }}>
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0C4A86', margin: 0 }}>Download Complete Backup</h3>
              <p style={{ fontSize: '12px', color: '#6B5B54', margin: '2px 0 0' }}>Export a JSON snapshot of all database tables.</p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#6B5B54', lineHeight: '1.5', marginBottom: '20px' }}>
            Generates a complete data file containing students, employees, fees, exams, attendance, notices, and settings. Store this backup safely.
          </p>

          <button
            onClick={handleDownloadBackup}
            disabled={backupLoading}
            style={{ width: '100%', padding: '12px', background: '#0C4A86', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={16} />
            {backupLoading ? 'Generating Backup JSON...' : 'Create & Download Backup'}
          </button>
        </div>

        {/* Restore Card */}
        <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0C4A86', margin: 0 }}>Restore System Database</h3>
              <p style={{ fontSize: '12px', color: '#6B5B54', margin: '2px 0 0' }}>Import records from a previously generated backup JSON file.</p>
            </div>
          </div>

          <form onSubmit={handleRestoreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0C4A86', marginBottom: '6px' }}>Select Backup JSON File</label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ width: '100%', padding: '10px', border: '1px dashed #BFDBFE', borderRadius: '8px', fontSize: '13px', background: '#FAF6F0' }}
              />
            </div>

            <button
              type="submit"
              disabled={restoreLoading || !selectedFile}
              style={{ width: '100%', padding: '12px', background: selectedFile ? '#B45309' : '#BFDBFE', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: selectedFile ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Upload size={16} />
              {restoreLoading ? 'Restoring System Data...' : 'Upload & Restore Database'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreManagement;
