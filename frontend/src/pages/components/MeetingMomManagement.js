import React, { useState, useEffect } from 'react';
import { exportToCSV, printPDF } from '../../utils/exportUtils';
import { Search, Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, FileText, Download, Printer, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { demoMeetingMoms } from '../../utils/demoData';

const MeetingMomManagement = () => {
  const [moms, setMoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    meetingType: 'staff_meeting',
    meetingDate: new Date().toISOString().slice(0, 10),
    time: '10:00 AM',
    venue: 'Conference Hall',
    organizer: '',
    attendees: '',
    agenda: '',
    keyDecisions: '',
    actionItems: '',
    status: 'published'
  });

  useEffect(() => {
    fetchMoms();
  }, [page, meetingTypeFilter]);

  const fetchMoms = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        meetingType: meetingTypeFilter,
      });

      const res = await fetch(`/api/meeting-moms?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.moms && data.moms.length > 0) {
        setMoms(data.moms);
        setTotalPages(data.totalPages || 1);
      } else {
        setMoms(demoMeetingMoms);
        setTotalPages(1);
      }
    } catch (err) {
      console.warn('Error fetching MOMs, using demo MOMs:', err);
      setMoms(demoMeetingMoms);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMoms();
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      meetingType: 'staff_meeting',
      meetingDate: new Date().toISOString().slice(0, 10),
      time: '10:00 AM',
      venue: 'Conference Hall',
      organizer: '',
      attendees: '',
      agenda: '',
      keyDecisions: '',
      actionItems: '',
      status: 'published'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (mom) => {
    setEditingId(mom.id);
    setFormData({ ...mom });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/meeting-moms/${editingId}` : '/api/meeting-moms';
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
        fetchMoms();
      } else {
        alert(data.message || 'Error saving Meeting MOM');
      }
    } catch (err) {
      console.error('Error saving MOM:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Meeting MOM record?')) return;
    try {
      const res = await fetch(`/api/meeting-moms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMoms();
      }
    } catch (err) {
      console.error('Error deleting MOM:', err);
    }
  };

  const handleExportCSV = () => {
    const formatted = moms.map(m => ({
      Title: m.title,
      Type: m.meetingType === 'staff_meeting' ? 'Staff Meeting' : 'PTM Meeting',
      Date: m.meetingDate,
      Time: m.time,
      Venue: m.venue,
      Organizer: m.organizer,
      Attendees: m.attendees,
      Agenda: m.agenda,
      KeyDecisions: m.keyDecisions,
      ActionItems: m.actionItems
    }));
    exportToCSV(formatted, `meeting_moms_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    const cols = [
      { header: 'Title', key: 'title' },
      { header: 'Type', key: 'type' },
      { header: 'Date', key: 'date' },
      { header: 'Venue', key: 'venue' },
      { header: 'Organizer', key: 'organizer' },
    ];
    const formatted = moms.map(m => ({
      title: m.title,
      type: m.meetingType === 'staff_meeting' ? 'Staff Meeting' : 'PTM Meeting',
      date: `${m.meetingDate} (${m.time || ''})`,
      venue: m.venue,
      organizer: m.organizer
    }));
    printPDF('Minutes of Meeting (MOM) Report', cols, formatted);
  };

  return (
    <div style={{ padding: '24px', background: '#F7F6F3', minHeight: '100vh' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#322029', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="#AC968D" /> Minutes of Meeting (MOM) - Staff & PTM
          </h2>
          <p style={{ fontSize: '13px', color: '#6B5B54', margin: '4px 0 0' }}>Record and manage Staff Meetings and Parent-Teacher Meetings (PTM) records.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#322029', cursor: 'pointer' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#322029', cursor: 'pointer' }}>
            <Printer size={15} /> Print PDF
          </button>
          <button onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#AC968D', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#ffffff', cursor: 'pointer' }}>
            <Plus size={16} /> Create New MOM
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8C7F79' }} />
            <input
              type="text"
              placeholder="Search title, agenda, decisions, or organizer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '9px 16px', background: '#6B5B54', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Search</button>
        </form>

        <select value={meetingTypeFilter} onChange={(e) => { setMeetingTypeFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px', outline: 'none', color: '#322029' }}>
          <option value="">All Meeting Types</option>
          <option value="staff_meeting">Staff Meetings</option>
          <option value="ptm_meeting">PTM Meetings</option>
        </select>
      </div>

      {/* MOM Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', gridColumn: '1 / -1', textCenter: 'center', color: '#6B5B54' }}>Loading Meeting MOM records...</div>
        ) : moms.length === 0 ? (
          <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: '#6B5B54' }}>No Meeting MOM records found.</div>
        ) : moms.map((mom) => (
          <div key={mom.id} style={{ background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                  background: mom.meetingType === 'staff_meeting' ? '#EFE9E1' : '#FEF3C7',
                  color: mom.meetingType === 'staff_meeting' ? '#322029' : '#B45309'
                }}>
                  {mom.meetingType === 'staff_meeting' ? 'Staff Meeting' : 'PTM Meeting'}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleOpenEditModal(mom)} style={{ border: 'none', background: '#EFE9E1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#AC968D' }} title="Edit">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(mom.id)} style={{ border: 'none', background: '#FEF2F2', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#322029', margin: '0 0 10px' }}>{mom.title}</h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6B5B54', marginBottom: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {mom.meetingDate}</span>
                {mom.time && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {mom.time}</span>}
                {mom.venue && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {mom.venue}</span>}
              </div>

              {mom.agenda && (
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '12px', color: '#322029', display: 'block', marginBottom: '2px' }}>Agenda:</strong>
                  <p style={{ fontSize: '12px', color: '#6B5B54', margin: 0, lineHeight: '1.4' }}>{mom.agenda}</p>
                </div>
              )}

              {mom.keyDecisions && (
                <div style={{ marginBottom: '10px', background: '#F7F6F3', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #AC968D' }}>
                  <strong style={{ fontSize: '11px', color: '#322029', display: 'block', marginBottom: '2px' }}>Key Decisions:</strong>
                  <p style={{ fontSize: '12px', color: '#6B5B54', margin: 0, lineHeight: '1.4' }}>{mom.keyDecisions}</p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #EFE9E1', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#8C7F79' }}>
              <span>Organizer: <strong>{mom.organizer || 'Admin'}</strong></span>
              <span>Published</span>
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
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #D9D8D9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #EFE9E1', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#322029' }}>{editingId ? 'Edit Meeting MOM' : 'Create New Meeting MOM'}</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B5B54' }}>&times;</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Meeting Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="e.g. Monthly Staff Academic Planning Meeting" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Meeting Type *</label>
                  <select value={formData.meetingType} onChange={e => setFormData({ ...formData, meetingType: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }}>
                    <option value="staff_meeting">Staff Meeting</option>
                    <option value="ptm_meeting">PTM Meeting</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Date *</label>
                  <input type="date" required value={formData.meetingDate} onChange={e => setFormData({ ...formData, meetingDate: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Time</label>
                  <input type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="10:00 AM" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Venue</label>
                  <input type="text" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="Conference Room A" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Agenda</label>
                <textarea rows="2" value={formData.agenda} onChange={e => setFormData({ ...formData, agenda: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="Main topics discussed..."></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#322029', marginBottom: '4px' }}>Key Decisions</label>
                <textarea rows="2" value={formData.keyDecisions} onChange={e => setFormData({ ...formData, keyDecisions: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D9D8D9', fontSize: '13px' }} placeholder="Decisions agreed upon..."></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 18px', background: '#ffffff', border: '1px solid #D9D8D9', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#322029' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 20px', background: '#AC968D', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingMomManagement;
