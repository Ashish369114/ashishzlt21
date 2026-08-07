import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/ManagementStyles.css';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Building, Users, Shield, Phone, Home, Filter, Eye, X, CheckCircle, Search } from 'lucide-react';

const defaultBlocks = [
  {
    _id: 'block_a',
    hostelName: 'Nalanda Boys Hostel (Block A)',
    blockCode: 'Block A',
    hostelType: 'boys',
    wardenName: 'Ramesh Sharma',
    wardenPhone: '9876543210',
    totalRooms: 6,
    totalBeds: 24,
    monthlyFee: 4500,
    floors: [
      {
        floorNumber: 1,
        floorName: 'Floor 1 (Ground Floor)',
        rooms: [
          {
            roomNumber: '101',
            capacity: 4,
            occupants: [
              { id: 'S101', name: 'Aarav Singh', admNo: 'ADM-2026-101', grade: 'Grade 9A', bedNo: 'Bed 1', parentPhone: '9876500101' },
              { id: 'S102', name: 'Rohan Kumar', admNo: 'ADM-2026-102', grade: 'Grade 9A', bedNo: 'Bed 2', parentPhone: '9876500102' },
              { id: 'S103', name: 'Vikram Verma', admNo: 'ADM-2026-103', grade: 'Grade 9B', bedNo: 'Bed 3', parentPhone: '9876500103' },
              { id: 'S104', name: 'Aditya Roy', admNo: 'ADM-2026-104', grade: 'Grade 9B', bedNo: 'Bed 4', parentPhone: '9876500104' },
            ]
          },
          {
            roomNumber: '102',
            capacity: 4,
            occupants: [
              { id: 'S105', name: 'Kabir Mehta', admNo: 'ADM-2026-105', grade: 'Grade 10A', bedNo: 'Bed 1', parentPhone: '9876500105' },
              { id: 'S106', name: 'Siddharth Rao', admNo: 'ADM-2026-106', grade: 'Grade 10A', bedNo: 'Bed 2', parentPhone: '9876500106' },
              { id: 'S107', name: 'Arjun Gupta', admNo: 'ADM-2026-107', grade: 'Grade 10B', bedNo: 'Bed 3', parentPhone: '9876500107' },
            ]
          }
        ]
      },
      {
        floorNumber: 2,
        floorName: 'Floor 2 (First Floor)',
        rooms: [
          {
            roomNumber: '201',
            capacity: 4,
            occupants: [
              { id: 'S108', name: 'Karan Sharma', admNo: 'ADM-2026-108', grade: 'Grade 8A', bedNo: 'Bed 1', parentPhone: '9876500108' },
              { id: 'S109', name: 'Devansh Joshi', admNo: 'ADM-2026-109', grade: 'Grade 8A', bedNo: 'Bed 2', parentPhone: '9876500109' },
              { id: 'S110', name: 'Harsh Patel', admNo: 'ADM-2026-110', grade: 'Grade 8B', bedNo: 'Bed 3', parentPhone: '9876500110' },
              { id: 'S111', name: 'Yash Verma', admNo: 'ADM-2026-111', grade: 'Grade 8B', bedNo: 'Bed 4', parentPhone: '9876500111' },
            ]
          },
          {
            roomNumber: '202',
            capacity: 4,
            occupants: [
              { id: 'S112', name: 'Gautam Malhotra', admNo: 'ADM-2026-112', grade: 'Grade 9A', bedNo: 'Bed 1', parentPhone: '9876500112' },
              { id: 'S113', name: 'Nikhil Sen', admNo: 'ADM-2026-113', grade: 'Grade 9B', bedNo: 'Bed 2', parentPhone: '9876500113' },
            ]
          }
        ]
      },
      {
        floorNumber: 3,
        floorName: 'Floor 3 (Second Floor)',
        rooms: [
          {
            roomNumber: '301',
            capacity: 4,
            occupants: [
              { id: 'S114', name: 'Vihaan Reddy', admNo: 'ADM-2026-114', grade: 'Grade 10A', bedNo: 'Bed 1', parentPhone: '9876500114' },
              { id: 'S115', name: 'Kunal Shah', admNo: 'ADM-2026-115', grade: 'Grade 10B', bedNo: 'Bed 2', parentPhone: '9876500115' },
              { id: 'S116', name: 'Rakesh Nair', admNo: 'ADM-2026-116', grade: 'Grade 10B', bedNo: 'Bed 3', parentPhone: '9876500116' },
              { id: 'S117', name: 'Varun Nair', admNo: 'ADM-2026-117', grade: 'Grade 10A', bedNo: 'Bed 4', parentPhone: '9876500117' },
            ]
          },
          {
            roomNumber: '302',
            capacity: 4,
            occupants: [
              { id: 'S118', name: 'Mohit Agarwal', admNo: 'ADM-2026-118', grade: 'Grade 9A', bedNo: 'Bed 1', parentPhone: '9876500118' },
              { id: 'S119', name: 'Tarun Gill', admNo: 'ADM-2026-119', grade: 'Grade 9B', bedNo: 'Bed 2', parentPhone: '9876500119' },
              { id: 'S120', name: 'Aman Deep', admNo: 'ADM-2026-120', grade: 'Grade 9A', bedNo: 'Bed 3', parentPhone: '9876500120' },
            ]
          }
        ]
      }
    ]
  },
  {
    _id: 'block_b',
    hostelName: 'Taxila Girls Hostel (Block B)',
    blockCode: 'Block B',
    hostelType: 'girls',
    wardenName: 'Sunita Roy',
    wardenPhone: '9876543211',
    totalRooms: 6,
    totalBeds: 24,
    monthlyFee: 4500,
    floors: [
      {
        floorNumber: 1,
        floorName: 'Floor 1 (Ground Floor)',
        rooms: [
          {
            roomNumber: '101',
            capacity: 4,
            occupants: [
              { id: 'S201', name: 'Ananya Roy', admNo: 'ADM-2026-201', grade: 'Grade 9A', bedNo: 'Bed 1', parentPhone: '9876500201' },
              { id: 'S202', name: 'Ishita Sharma', admNo: 'ADM-2026-202', grade: 'Grade 9A', bedNo: 'Bed 2', parentPhone: '9876500202' },
              { id: 'S203', name: 'Diya Patel', admNo: 'ADM-2026-203', grade: 'Grade 9B', bedNo: 'Bed 3', parentPhone: '9876500203' },
              { id: 'S204', name: 'Riya Sen', admNo: 'ADM-2026-204', grade: 'Grade 9B', bedNo: 'Bed 4', parentPhone: '9876500204' },
            ]
          },
          {
            roomNumber: '102',
            capacity: 4,
            occupants: [
              { id: 'S205', name: 'Neha Gupta', admNo: 'ADM-2026-205', grade: 'Grade 10A', bedNo: 'Bed 1', parentPhone: '9876500205' },
              { id: 'S206', name: 'Tanvi Joshi', admNo: 'ADM-2026-206', grade: 'Grade 10A', bedNo: 'Bed 2', parentPhone: '9876500206' },
              { id: 'S207', name: 'Meera Verma', admNo: 'ADM-2026-207', grade: 'Grade 10B', bedNo: 'Bed 3', parentPhone: '9876500207' },
            ]
          }
        ]
      },
      {
        floorNumber: 2,
        floorName: 'Floor 2 (First Floor)',
        rooms: [
          {
            roomNumber: '201',
            capacity: 4,
            occupants: [
              { id: 'S208', name: 'Pooja Shah', admNo: 'ADM-2026-208', grade: 'Grade 8A', bedNo: 'Bed 1', parentPhone: '9876500208' },
              { id: 'S209', name: 'Anushka Malhotra', admNo: 'ADM-2026-209', grade: 'Grade 8A', bedNo: 'Bed 2', parentPhone: '9876500209' },
              { id: 'S210', name: 'Sneha Rao', admNo: 'ADM-2026-210', grade: 'Grade 8B', bedNo: 'Bed 3', parentPhone: '9876500210' },
              { id: 'S211', name: 'Ritu Deep', admNo: 'ADM-2026-211', grade: 'Grade 8B', bedNo: 'Bed 4', parentPhone: '9876500211' },
            ]
          },
          {
            roomNumber: '202',
            capacity: 4,
            occupants: [
              { id: 'S212', name: 'Sanjana Gill', admNo: 'ADM-2026-212', grade: 'Grade 9A', bedNo: 'Bed 1', parentPhone: '9876500212' },
              { id: 'S213', name: 'Preeti Nair', admNo: 'ADM-2026-213', grade: 'Grade 9B', bedNo: 'Bed 2', parentPhone: '9876500213' },
            ]
          }
        ]
      },
      {
        floorNumber: 3,
        floorName: 'Floor 3 (Second Floor)',
        rooms: [
          {
            roomNumber: '301',
            capacity: 4,
            occupants: [
              { id: 'S214', name: 'Simran Kaur', admNo: 'ADM-2026-214', grade: 'Grade 10A', bedNo: 'Bed 1', parentPhone: '9876500214' },
              { id: 'S215', name: 'Priya Sharma', admNo: 'ADM-2026-215', grade: 'Grade 10B', bedNo: 'Bed 2', parentPhone: '9876500215' },
              { id: 'S216', name: 'Kavita Reddy', admNo: 'ADM-2026-216', grade: 'Grade 10B', bedNo: 'Bed 3', parentPhone: '9876500216' },
              { id: 'S217', name: 'Shreya Das', admNo: 'ADM-2026-217', grade: 'Grade 10A', bedNo: 'Bed 4', parentPhone: '9876500217' },
            ]
          },
          {
            roomNumber: '302',
            capacity: 4,
            occupants: [
              { id: 'S218', name: 'Divya Iyer', admNo: 'ADM-2026-218', grade: 'Grade 9A', bedNo: 'Bed 1', parentPhone: '9876500218' },
              { id: 'S219', name: 'Swati Jain', admNo: 'ADM-2026-219', grade: 'Grade 9B', bedNo: 'Bed 2', parentPhone: '9876500219' },
              { id: 'S220', name: 'Bhavna Saxena', admNo: 'ADM-2026-220', grade: 'Grade 9A', bedNo: 'Bed 3', parentPhone: '9876500220' },
            ]
          }
        ]
      }
    ]
  }
];

const HostelManagement = () => {
  const [hostels, setHostels] = useState(defaultBlocks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter States
  const [selectedGender, setSelectedGender] = useState('all'); // 'all' | 'boys' | 'girls'
  const [selectedBlock, setSelectedBlock] = useState('all'); // 'all' | 'block_a' | 'block_b'
  const [selectedFloor, setSelectedFloor] = useState('all'); // 'all' | '1' | '2' | '3'
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Room Modal State ("Who is in this room?")
  const [viewingRoom, setViewingRoom] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ name: '', admNo: '', grade: '', parentPhone: '' });
  const [assignError, setAssignError] = useState('');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHostelId, setEditingHostelId] = useState(null);
  const [newHostel, setNewHostel] = useState({
    hostelName: '',
    hostelType: 'boys',
    wardenName: '',
    wardenPhone: '',
    totalRooms: 6,
    totalBeds: 24,
    monthlyFee: 4500,
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hostels').catch(() => ({ data: [] }));
      const apiHostels = Array.isArray(response.data) ? response.data : [];

      if (apiHostels.length > 0) {
        // API returned blocks — inject floor/room data from defaultBlocks if missing
        const enriched = apiHostels.map((h, idx) => {
          const hasFloors = h.floors && h.floors.length > 0 &&
            h.floors.some(f => f.rooms && f.rooms.length > 0 && f.rooms.some(r => r.occupants && r.occupants.length > 0));
          if (hasFloors) return h;
          // Use matching defaultBlocks floors based on hostelType or index
          const fallback = defaultBlocks.find(d =>
            (h.hostelType || '').toLowerCase() === d.hostelType ||
            idx === defaultBlocks.indexOf(d)
          ) || defaultBlocks[idx % defaultBlocks.length];
          return { ...h, floors: fallback.floors, totalRooms: fallback.totalRooms, totalBeds: fallback.totalBeds };
        });
        setHostels(enriched);
      } else {
        setHostels(defaultBlocks);
      }
    } catch (error) {
      console.warn('API error, using demo hostel blocks:', error);
      setHostels(defaultBlocks);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHostel({ ...newHostel, [name]: value });
  };

  const handleEditHostel = (hostel) => {
    setEditingHostelId(hostel._id);
    setNewHostel({
      hostelName: hostel.hostelName,
      hostelType: hostel.hostelType || 'boys',
      wardenName: hostel.wardenName,
      wardenPhone: hostel.wardenPhone,
      totalRooms: hostel.totalRooms || 6,
      totalBeds: hostel.totalBeds || 24,
      monthlyFee: hostel.monthlyFee || 4500,
    });
    setShowAddForm(true);
  };

  const resetHostelForm = () => {
    setEditingHostelId(null);
    setNewHostel({
      hostelName: '',
      hostelType: 'boys',
      wardenName: '',
      wardenPhone: '',
      totalRooms: 6,
      totalBeds: 24,
      monthlyFee: 4500,
    });
    setError('');
  };

  const handleAddHostel = async (e) => {
    e.preventDefault();
    if (!newHostel.hostelName || !newHostel.hostelType) {
      setError('Please fill in all required fields: Hostel Name and Type');
      return;
    }

    try {
      if (editingHostelId) {
        setHostels(prev => prev.map(h => h._id === editingHostelId ? { ...h, ...newHostel } : h));
        alert('Hostel updated successfully!');
      } else {
        const created = {
          _id: `block_${Date.now()}`,
          ...newHostel,
          floors: [
            { floorNumber: 1, floorName: 'Floor 1 (Ground Floor)', rooms: [{ roomNumber: '101', capacity: 4, occupants: [] }, { roomNumber: '102', capacity: 4, occupants: [] }] },
            { floorNumber: 2, floorName: 'Floor 2 (First Floor)', rooms: [{ roomNumber: '201', capacity: 4, occupants: [] }, { roomNumber: '202', capacity: 4, occupants: [] }] },
            { floorNumber: 3, floorName: 'Floor 3 (Second Floor)', rooms: [{ roomNumber: '301', capacity: 4, occupants: [] }, { roomNumber: '302', capacity: 4, occupants: [] }] }
          ]
        };
        setHostels(prev => [...prev, created]);
        alert('Hostel added successfully!');
      }
      setShowAddForm(false);
      resetHostelForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHostel = (id) => {
    if (window.confirm('Are you sure you want to delete this hostel block?')) {
      setHostels(prev => prev.filter(h => h._id !== id));
    }
  };

  // Assign a student to the currently viewed room
  const handleAssignStudent = () => {
    if (!assignForm.name.trim() || !assignForm.admNo.trim() || !assignForm.grade.trim()) {
      setAssignError('Name, Admission No, and Grade are required.'); return;
    }
    if (!viewingRoom) return;
    const newOccupant = {
      id: `S_${Date.now()}`,
      name: assignForm.name.trim(),
      admNo: assignForm.admNo.trim(),
      grade: assignForm.grade.trim(),
      parentPhone: assignForm.parentPhone.trim() || '—',
      bedNo: `Bed ${(viewingRoom.occupants || []).length + 1}`,
    };
    // Update hostels state in place
    setHostels(prev => prev.map(block => ({
      ...block,
      floors: (block.floors || []).map(floor => ({
        ...floor,
        rooms: (floor.rooms || []).map(room => {
          if (room.roomNumber !== viewingRoom.roomNumber) return room;
          return { ...room, occupants: [...(room.occupants || []), newOccupant] };
        })
      }))
    })));
    // Also update the viewingRoom state so modal reflects change immediately
    setViewingRoom(prev => ({ ...prev, occupants: [...(prev.occupants || []), newOccupant] }));
    setAssignForm({ name: '', admNo: '', grade: '', parentPhone: '' });
    setAssignError('');
    setShowAssignForm(false);
  };

  // Remove a student from the currently viewed room
  const handleRemoveStudent = (studentId) => {
    if (!window.confirm('Remove this student from the room?')) return;
    setHostels(prev => prev.map(block => ({
      ...block,
      floors: (block.floors || []).map(floor => ({
        ...floor,
        rooms: (floor.rooms || []).map(room => {
          if (room.roomNumber !== viewingRoom.roomNumber) return room;
          return { ...room, occupants: (room.occupants || []).filter(o => o.id !== studentId) };
        })
      }))
    })));
    setViewingRoom(prev => ({ ...prev, occupants: (prev.occupants || []).filter(o => o.id !== studentId) }));
  };

  // Filter Logic — uses hostelName as block key (always a plain string)
  const filteredBlocks = hostels.filter(block => {
    if (selectedGender !== 'all' && (block.hostelType || '').toLowerCase() !== selectedGender.toLowerCase()) return false;
    if (selectedBlock !== 'all' && block.hostelName !== selectedBlock) return false;
    return true;
  });

  return (
    <div className="management-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      
      {/* Header Title & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
                background: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back
            </button>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#0C4A86' }}>Hostel Management & Resident Directory</h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
            Manage Boys & Girls Hostel Blocks, Floor Maps (3 Floors), and Student Room Occupancy.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn-primary" 
          style={{ padding: '10px 20px', borderRadius: '50px', fontWeight: '700', background: '#0C4A86', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(12,74,134,0.2)' }}
        >
          + Add New Hostel Block
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1.5px solid #BFDBFE', marginBottom: '28px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#0C4A86', fontWeight: '800', fontSize: '0.95rem' }}>
          <Filter size={18} />
          <span>Filter Blocks, Floors & Rooms ("Who is Where")</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Gender Filter */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Gender / Type:</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="all">🏢 All Hostels (Boys & Girls)</option>
              <option value="boys">👦 Boys Hostels</option>
              <option value="girls">👧 Girls Hostels</option>
            </select>
          </div>

          {/* Block Filter */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Select Hostel Block:</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="all">All Blocks</option>
              {hostels.map((b, idx) => (
                <option key={idx} value={b.hostelName}>{b.hostelName}</option>
              ))}
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Select Floor:</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="all">🏢 All Floors (1, 2 & 3)</option>
              <option value="1">Floor 1 (Ground Floor)</option>
              <option value="2">Floor 2 (First Floor)</option>
              <option value="3">Floor 3 (Second Floor)</option>
            </select>
          </div>

          {/* Room Filter */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Room Search / Filter:</label>
            <select
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="all">🚪 All Rooms</option>
              <option value="101">Room 101</option>
              <option value="102">Room 102</option>
              <option value="201">Room 201</option>
              <option value="202">Room 202</option>
              <option value="301">Room 301</option>
              <option value="302">Room 302</option>
            </select>
          </div>
        </div>
      </div>

      {/* HOSTEL BLOCKS & 3-FLOOR ROOM MAPS */}
      {filteredBlocks.map(block => (
        <div key={block._id} style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #BFDBFE', padding: '24px', marginBottom: '32px', boxShadow: '0 10px 25px -5px rgba(12,74,134,0.05)' }}>
          
          {/* Block Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #EBF5FF', pb: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: (block.hostelType || '').toLowerCase() === 'girls' ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' : 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Building size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0C4A86' }}>{block.hostelName}</h2>
                  <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', background: block.hostelType === 'girls' ? '#fce7f3' : '#EBF5FF', color: block.hostelType === 'girls' ? '#be185d' : '#0C4A86', textTransform: 'uppercase' }}>
                    {block.hostelType === 'girls' ? '👧 Girls Block' : '👦 Boys Block'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.85rem', color: '#475569' }}>
                  <span>🛡️ Warden: <strong style={{ color: '#0f172a' }}>{block.wardenName}</strong></span>
                  <span>📞 Phone: <strong style={{ color: '#0C4A86' }}>{block.wardenPhone}</strong></span>
                  <span>💰 Fee: <strong style={{ color: '#059669' }}>{formatCurrency(block.monthlyFee)}/mo</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEditHostel(block)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#ebf5ff', color: '#0C4A86', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>Edit Block</button>
              <button onClick={() => handleDeleteHostel(block._id)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>

          {/* 3 FLOORS GRID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(block.floors || []).map(floor => {
              // Apply floor filter
              if (selectedFloor !== 'all' && String(floor.floorNumber) !== String(selectedFloor)) return null;

              const filteredRooms = (floor.rooms || []).filter(room => {
                if (selectedRoomNumber !== 'all' && String(room.roomNumber) !== String(selectedRoomNumber)) return false;
                // Apply student search
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  const hasMatch = (room.occupants || []).some(o =>
                    (o.name || '').toLowerCase().includes(q) ||
                    (o.admNo || '').toLowerCase().includes(q) ||
                    (o.grade || '').toLowerCase().includes(q)
                  );
                  if (!hasMatch) return false;
                }
                return true;
              });

              if (filteredRooms.length === 0) return null;

              return (
                <div key={floor.floorNumber} style={{ background: '#FAF6F0', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🏢</span> {floor.floorName}
                    </h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>{filteredRooms.length} Rooms</span>
                  </div>

                  {/* ROOM CARDS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {filteredRooms.map(room => {
                      const totalBeds = room.capacity || 4;
                      const occupiedBeds = room.occupants ? room.occupants.length : 0;
                      const isFull = occupiedBeds >= totalBeds;

                      return (
                        <div
                          key={room.roomNumber}
                          onClick={() => setViewingRoom({ blockName: block.hostelName, hostelType: block.hostelType, wardenName: block.wardenName, wardenPhone: block.wardenPhone, floorName: floor.floorName, ...room })}
                          style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1.5px solid #BFDBFE',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0096DA'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0C4A86' }}>🚪 Room {room.roomNumber}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '50px', background: isFull ? '#fef2f2' : '#f0fdf4', color: isFull ? '#dc2626' : '#16a34a' }}>
                              {isFull ? 'FULL' : `${totalBeds - occupiedBeds} Beds Free`}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '10px' }}>
                            <span>Occupancy: </span>
                            <strong style={{ color: '#0f172a' }}>{occupiedBeds} / {totalBeds} Beds</strong>
                          </div>

                          {/* Occupants Preview */}
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Resident Students:</div>
                            {room.occupants && room.occupants.length > 0 ? (
                              room.occupants.slice(0, 2).map((st, idx) => (
                                <div key={idx} style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  • {st.name} ({st.grade})
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No students assigned yet</div>
                            )}
                            {room.occupants && room.occupants.length > 2 && (
                              <div style={{ fontSize: '0.72rem', color: '#0096DA', fontWeight: '700', marginTop: '2px' }}>
                                +{room.occupants.length - 2} more → Click to view all
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ))}

      {/* ROOM OCCUPANTS MODAL ("Who is in this room?") */}
      {viewingRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '2px solid #BFDBFE' }}>
            
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '50px' }}>
                  {viewingRoom.blockName} • {viewingRoom.floorName}
                </span>
                <h2 style={{ margin: '6px 0 0', fontSize: '1.4rem', fontWeight: '800' }}>🚪 Room {viewingRoom.roomNumber} Resident Students</h2>
              </div>
              <button onClick={() => setViewingRoom(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#F0F7FF', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #BFDBFE', fontSize: '0.85rem' }}>
                <div>Warden: <strong style={{ color: '#0C4A86' }}>{viewingRoom.wardenName}</strong></div>
                <div>Warden Phone: <strong style={{ color: '#0C4A86' }}>{viewingRoom.wardenPhone}</strong></div>
                <div>Total Capacity: <strong style={{ color: '#059669' }}>{viewingRoom.capacity || 4} Beds</strong></div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0C4A86' }}>Resident Students List:</h3>
                {(viewingRoom.occupants || []).length < (viewingRoom.capacity || 4) && (
                  <button
                    onClick={() => { setShowAssignForm(v => !v); setAssignError(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#0C4A86', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {showAssignForm ? '✕ Cancel' : '+ Assign Student'}
                  </button>
                )}
                {(viewingRoom.occupants || []).length >= (viewingRoom.capacity || 4) && (
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '50px' }}>🔒 Room Full</span>
                )}
              </div>

              {/* Assign Student Form */}
              {showAssignForm && (
                <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0C4A86', marginBottom: '12px' }}>📋 Assign New Student to Room {viewingRoom.roomNumber}</div>
                  {assignError && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600', marginBottom: '10px' }}>{assignError}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Student Name *</label>
                      <input value={assignForm.name} onChange={e => setAssignForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Aarav Sharma" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Admission No *</label>
                      <input value={assignForm.admNo} onChange={e => setAssignForm(p => ({...p, admNo: e.target.value}))} placeholder="e.g. ADM-2026-150" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Grade & Section *</label>
                      <input value={assignForm.grade} onChange={e => setAssignForm(p => ({...p, grade: e.target.value}))} placeholder="e.g. Grade 9A" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Parent Phone</label>
                      <input value={assignForm.parentPhone} onChange={e => setAssignForm(p => ({...p, parentPhone: e.target.value}))} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button onClick={handleAssignStudent} style={{ padding: '8px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>✅ Confirm Assignment</button>
                    <button onClick={() => { setShowAssignForm(false); setAssignError(''); }} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {viewingRoom.occupants && viewingRoom.occupants.length > 0 ? (
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>Bed No</th>
                        <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>Student Name</th>
                        <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>Admission No</th>
                        <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>Grade & Section</th>
                        <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>Parent Phone</th>
                        <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingRoom.occupants.map((st, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0096DA' }}>{st.bedNo || `Bed ${idx + 1}`}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>{st.name}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0C4A86' }}>{st.admNo}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#475569' }}>{st.grade}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#059669' }}>{st.parentPhone}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => handleRemoveStudent(st.id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.9rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  🛏️ No students currently assigned to Room {viewingRoom.roomNumber}.<br />
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Click "+ Assign Student" above to add a resident.</span>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {(viewingRoom.occupants || []).length}/{viewingRoom.capacity || 4} beds occupied
              </span>
              <button onClick={() => { setViewingRoom(null); setShowAssignForm(false); setAssignError(''); }} style={{ padding: '8px 20px', borderRadius: '50px', background: '#0C4A86', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT HOSTEL MODAL */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0C4A86', fontSize: '1.25rem', fontWeight: '800' }}>{editingHostelId ? 'Update Hostel Block' : 'Add New Hostel Block'}</h3>
              <button onClick={() => { resetHostelForm(); setShowAddForm(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280', padding: '0 5px' }}>&times;</button>
            </div>
            <form onSubmit={handleAddHostel} className="management-form" style={{ marginBottom: 0, boxShadow: 'none', padding: 0 }}>
              {error && <div style={{ color: '#d32f2f', marginBottom: '10px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Hostel Name:</label>
                  <input
                    type="text"
                    name="hostelName"
                    placeholder="e.g. Nalanda Boys Hostel (Block A)"
                    value={newHostel.hostelName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Hostel Type:</label>
                  <select name="hostelType" value={newHostel.hostelType} onChange={handleInputChange}>
                    <option value="boys">Boys Hostel</option>
                    <option value="girls">Girls Hostel</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Warden Name:</label>
                  <input
                    type="text"
                    name="wardenName"
                    placeholder="Warden Name"
                    value={newHostel.wardenName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Warden Phone:</label>
                  <input
                    type="tel"
                    name="wardenPhone"
                    placeholder="Warden Phone"
                    value={newHostel.wardenPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Total Rooms:</label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={newHostel.totalRooms}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Total Beds:</label>
                  <input
                    type="number"
                    name="totalBeds"
                    value={newHostel.totalBeds}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Monthly Fee (₹):</label>
                  <input
                    type="number"
                    name="monthlyFee"
                    value={newHostel.monthlyFee}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ background: '#0C4A86', color: '#fff', padding: '10px 24px', borderRadius: '50px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                  {editingHostelId ? 'Update Hostel' : 'Add Hostel Block'}
                </button>
                <button type="button" onClick={() => { resetHostelForm(); setShowAddForm(false); }} style={{ padding: '10px 24px', borderRadius: '50px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HostelManagement;
