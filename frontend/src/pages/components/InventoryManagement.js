import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, Search, CheckCircle, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';

const initialInventoryData = [
  {
    id: 1,
    name: 'School Uniforms (Set)',
    category: 'Uniforms',
    totalStock: 20,
    issuedQuantity: 0,
    unitPrice: 1500,
    status: 'In Stock'
  },
  {
    id: 2,
    name: 'Academic Textbooks Set',
    category: 'Books',
    totalStock: 20,
    issuedQuantity: 0,
    unitPrice: 850,
    status: 'In Stock'
  }
];

const InventoryManagement = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('inventory_items');
    return saved ? JSON.parse(saved) : initialInventoryData;
  });

  const [search, setSearch] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');

  // Save to localStorage whenever items change so Dashboard can read total count
  useEffect(() => {
    localStorage.setItem('inventory_items', JSON.stringify(items));
  }, [items]);

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem || issueQty <= 0) return;

    const available = selectedItem.totalStock - selectedItem.issuedQuantity;
    if (issueQty > available) {
      alert(`Cannot issue ${issueQty} items. Only ${available} available in stock!`);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === selectedItem.id) {
          const newIssued = item.issuedQuantity + Number(issueQty);
          const newAvailable = item.totalStock - newIssued;
          return {
            ...item,
            issuedQuantity: newIssued,
            status: newAvailable === 0 ? 'Out of Stock' : newAvailable < 5 ? 'Low Stock' : 'In Stock'
          };
        }
        return item;
      })
    );

    setShowIssueModal(false);
    setSelectedItem(null);
    setIssueQty(1);
    setStudentName('');
    setStudentRoll('');
  };

  const handleResetStock = (id) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, issuedQuantity: 0, status: 'In Stock' } : item)
    );
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalStockCount = items.reduce((acc, i) => acc + i.totalStock, 0);
  const totalIssuedCount = items.reduce((acc, i) => acc + i.issuedQuantity, 0);
  const totalAvailableCount = totalStockCount - totalIssuedCount;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={26} color="#3b82f6" /> Inventory & Stock Management
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Manage school uniforms, books, and stock distribution to students.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total Stock</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{totalStockCount}</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Issued to Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8b5cf6', marginTop: '6px' }}>{totalIssuedCount}</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Available Stock</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>{totalAvailableCount}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '16px 24px' }}>Item Name</th>
              <th style={{ padding: '16px 24px' }}>Category</th>
              <th style={{ padding: '16px 24px' }}>Total Initial Stock</th>
              <th style={{ padding: '16px 24px' }}>Issued</th>
              <th style={{ padding: '16px 24px' }}>Available</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const available = item.totalStock - item.issuedQuantity;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>{item.totalStock}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#8b5cf6' }}>{item.issuedQuantity}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '800', color: available > 0 ? '#10b981' : '#ef4444' }}>{available}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      background: available > 5 ? '#dcfce7' : available > 0 ? '#fef3c7' : '#fee2e2',
                      color: available > 5 ? '#15803d' : available > 0 ? '#b45309' : '#b91c1c'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIssueQty(1);
                        setShowIssueModal(true);
                      }}
                      disabled={available <= 0}
                      style={{
                        padding: '8px 16px',
                        background: available > 0 ? '#3b82f6' : '#cbd5e1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: available > 0 ? 'pointer' : 'not-allowed',
                        marginRight: '8px'
                      }}
                    >
                      Issue to Student
                    </button>

                    <button
                      onClick={() => handleResetStock(item.id)}
                      title="Reset issued count"
                      style={{
                        padding: '8px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>

      {/* Modal for Issuing Items to Student */}
      {showIssueModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
              Issue {selectedItem.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Currently Available in Stock: <strong>{selectedItem.totalStock - selectedItem.issuedQuantity}</strong>
            </p>

            <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Quantity to Issue</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.totalStock - selectedItem.issuedQuantity}
                  value={issueQty}
                  onChange={(e) => setIssueQty(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryManagement;
