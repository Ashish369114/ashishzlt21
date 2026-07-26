import React, { useState, useEffect } from 'react';
import { exportToCSV, printPDF } from '../../utils/exportUtils';
import { Search, Plus, Edit, Trash2, Bell, Calendar, User, Download, Printer, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Principal Circular',
    targetAudience: 'all',
    publishedBy: '',
    publishDate: new Date().toISOString().slice(0, 10),
    priority: 'normal',
    status: 'active'
  });

  useEffect(() => {
    fetchNotices();
  }, [page, audienceFilter, categoryFilter]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        targetAudience: audienceFilter,
        category: categoryFilter,
      });

      const res = await fetch(`/api/notices?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.notices && data.notices.length > 0) {
        setNotices(data.notices);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotices(demoNotices);
        setTotalPages(1);
      }
    } catch (err) {
      console.warn('Error fetching notices, using demo notices:', err);
      setNotices(demoNotices);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotices();
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      category: 'Principal Circular',
      targetAudience: 'all',
      publishedBy: '',
      publishDate: new Date().toISOString().slice(0, 10),
      priority: 'normal',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (notice) => {
    setEditingId(notice.id);
    setFormData({ ...notice });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/notices/${editingId}` : '/api/notices';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchNotices();
      } else {
        alert(data.message || 'Error saving Notice');
      }
    } catch (err) {
      console.error('Error saving Notice:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Notice?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchNotices();
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
    }
  };

  const handleExportCSV = () => {
    const formatted = notices.map(n => ({
      Title: n.title,
      Category: n.category,
      Audience: n.targetAudience,
      Priority: n.priority,
      PublishDate: n.publishDate,
      PublishedBy: n.publishedBy,
      Content: n.content
    }));
    exportToCSV(formatted, `principal_notices_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    const cols = [
      { header: 'Title', key: 'title' },
      { header: 'Category', key: 'category' },
      { header: 'Target Audience', key: 'audience' },
      { header: 'Date', key: 'date' },
      { header: 'Published By', key: 'by' },
    ];
    const formatted = notices.map(n => ({
      title: n.title,
      category: n.category,
      audience: n.targetAudience.toUpperCase(),
      date: n.publishDate,
      by: n.publishedBy
    }));
    printPDF('Principal Notices & Circulars Report', cols, formatted);
  };

  return (
    <div style={{ padding: '24px', background: '#F7F6F3', minHeight: '100vh' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#322029', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={22} color="#AC968D" /> Principal Notices & Circulars
          </h2>
          <p style={{ fontSize: '13px', color: '#6B5B54', margin: '4px 0 0' }}>Publish, manage, and distribute circulars and notices across staff, students, and parents.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#322029', cursor: 'pointer' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#322029', cursor: 'pointer' }}>
            <Printer size={15} /> Print PDF
          </button>
          <button onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#AC968D', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#ffffff', cursor: 'pointer' }}>
            <Plus size={16} /> Publish Notice
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8C7F79' }} />
            <input
              type="text"
              placeholder="Search title, content, or publisher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '9px 16px', background: '#6B5B54', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Search</button>
        </form>

        <select value={audienceFilter} onChange={(e) => { setAudienceFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px', outline: 'none', color: '#322029' }}>
          <option value="">All Target Audiences</option>
          <option value="all">All School</option>
          <option value="teachers">Teachers Only</option>
          <option value="parents">Parents Only</option>
          <option value="students">Students Only</option>
        </select>
      </div>

      {/* Notice List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', color: '#6B5B54' }}>Loading notices...</div>
        ) : (notices.length === 0 ? demoNotices : notices).map((notice) => (
          <div key={notice.id || notice._id} style={{ background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                  background: notice.priority === 'urgent' ? '#FEE2E2' : notice.priority === 'high' ? '#FFEDD5' : '#EFE9E1',
                  color: notice.priority === 'urgent' ? '#B91C1C' : notice.priority === 'high' ? '#C2410C' : '#322029'
                }}>
                  {notice.priority} Priority
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B5B54' }}>{notice.category}</span>
                <span style={{ fontSize: '11px', color: '#8C7F79' }}>• Target: <strong style={{ color: '#322029', textTransform: 'capitalize' }}>{notice.targetAudience}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleOpenEditModal(notice)} style={{ border: 'none', background: '#EFE9E1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#AC968D' }} title="Edit">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(notice.id || notice._id)} style={{ border: 'none', background: '#FEF2F2', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#322029', margin: 0 }}>{notice.title}</h3>
            <p style={{ fontSize: '13px', color: '#6B5B54', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{notice.content}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EFE9E1', paddingTop: '10px', fontSize: '12px', color: '#8C7F79' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> Published on: {notice.publishDate || notice.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13} /> Published by: <strong>{notice.publishedBy || notice.author || 'Principal'}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#6B5B54' }}>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #D9D8D9', borderRadius: '6px', background: '#fff', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'default' : 'pointer', color: '#322029' }}>
            <ChevronLeft size={14} /> Previous
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #D9D8D9', borderRadius: '6px', background: '#fff', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'default' : 'pointer', color: '#322029' }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(50, 32, 41, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #D9D8D9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #EFE9E1', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#322029' }}>{editingId ? 'Edit Notice / Circular' : 'Publish New Notice'}</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B5B54' }}>&times;</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Notice Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="e.g. Annual Sports Day Announcement" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Target Audience</label>
                  <select value={formData.targetAudience} onChange={e => setFormData({ ...formData, targetAudience: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }}>
                    <option value="all">All School (Everyone)</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="students">Students Only</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Priority Level</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Notice Content *</label>
                <textarea rows="4" required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="Type the official circular details here..."></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 18px', background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#322029' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 20px', background: '#AC968D', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;
