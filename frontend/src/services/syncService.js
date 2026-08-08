import { demoConcessions, demoStudents } from '../utils/demoData';

const CHANNEL_NAME = 'school_os_realtime_sync';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;

export const broadcastDataChange = (actionType, payload) => {
  const syncEvent = {
    actionType,
    payload,
    sender: localStorage.getItem('role') || 'User',
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Post to BroadcastChannel (for other tabs)
    if (broadcastChannel) {
      broadcastChannel.postMessage(syncEvent);
    }
    // 2. Dispatch custom event (for same tab)
    window.dispatchEvent(new CustomEvent('school_realtime_event', { detail: syncEvent }));

    // 3. Save sync event log in localStorage
    const logs = JSON.parse(localStorage.getItem('school_sync_activity_log') || '[]');
    logs.unshift(syncEvent);
    localStorage.setItem('school_sync_activity_log', JSON.stringify(logs.slice(0, 50)));
  } catch (err) {
    console.error('Error broadcasting realtime change:', err);
  }
};

export const subscribeToDataChanges = (callback) => {
  const handleMessage = (event) => {
    const data = event.detail || event.data;
    if (data && callback) {
      callback(data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }
  window.addEventListener('school_realtime_event', handleMessage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('school_realtime_event', handleMessage);
  };
};

export const getSyncHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('school_sync_activity_log') || '[]');
  } catch {
    return [];
  }
};

export const getUnifiedStudents = (apiStudents = []) => {
  try {
    const localSaved = JSON.parse(localStorage.getItem('school_students') || '[]');
    const combinedMap = new Map();

    // 1. Load canonical demo students (300 students, 10 per class across all 30 classes)
    (demoStudents || []).forEach((s) => {
      const id = s._id || s.id;
      if (id) combinedMap.set(String(id), s);
    });

    // 2. Merge API students from backend
    (apiStudents || []).forEach((s) => {
      const id = s._id || s.id;
      if (!id) return;
      const key = String(id);
      const existing = combinedMap.get(key);
      if (existing) {
        combinedMap.set(key, { ...existing, ...s });
      } else {
        combinedMap.set(key, s);
      }
    });

    // 3. Merge localStorage saved students
    (localSaved || []).forEach((s) => {
      const id = s._id || s.id;
      if (!id) return;
      const key = String(id);
      const existing = combinedMap.get(key);
      if (existing) {
        combinedMap.set(key, { ...existing, ...s });
      } else {
        combinedMap.set(key, s);
      }
    });

    const allStudents = Array.from(combinedMap.values());

    // Group and guarantee all 10 students per section (Grade 1-A, 1-B, ..., 10-C)
    const sectionGroups = {};
    allStudents.forEach(st => {
      const g = String(st.grade || st.class?.grade || '1');
      const s = String(st.section || st.class?.section || 'A');
      const key = `${g}_${s}`;
      if (!sectionGroups[key]) sectionGroups[key] = [];
      if (sectionGroups[key].length < 10) {
        sectionGroups[key].push(st);
      }
    });

    const final10PerSection = Object.values(sectionGroups).flat();
    return final10PerSection.length > 0 ? final10PerSection : demoStudents;
  } catch (e) {
    return demoStudents || apiStudents;
  }
};

export const getUnifiedConcessions = (apiConcessions = []) => {
  try {
    let localSaved = JSON.parse(localStorage.getItem('school_concessions') || 'null');
    
    // Auto-seed initial demo concessions to localStorage if not yet initialized so refresh never wipes records
    if (!localSaved || !Array.isArray(localSaved) || localSaved.length === 0) {
      localSaved = demoConcessions || [];
      try {
        localStorage.setItem('school_concessions', JSON.stringify(localSaved));
      } catch (e) {}
    }

    const combinedMap = new Map();

    // 1. Initial canonical demo concessions
    (demoConcessions || []).forEach((c) => {
      if (c && c._id) combinedMap.set(String(c._id), c);
    });

    // 2. API concessions from backend
    (apiConcessions || []).forEach((c) => {
      if (c && c._id) combinedMap.set(String(c._id), c);
    });

    // 3. Locally granted/saved concessions (Principal grant / edit)
    (localSaved || []).forEach((c) => {
      if (c && c._id) combinedMap.set(String(c._id), c);
    });

    const result = Array.from(combinedMap.values());
    return result.length > 0 ? result : (demoConcessions || []);
  } catch (e) {
    return apiConcessions && apiConcessions.length > 0 ? apiConcessions : (demoConcessions || []);
  }
};

export const saveConcessionLocally = (newConcession) => {
  try {
    let existing = JSON.parse(localStorage.getItem('school_concessions') || 'null');
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      existing = [...(demoConcessions || [])];
    }
    const updated = [newConcession, ...existing.filter(c => String(c._id) !== String(newConcession._id))];
    localStorage.setItem('school_concessions', JSON.stringify(updated));
    broadcastDataChange('CONCESSION_GRANTED', newConcession);
    return updated;
  } catch (e) {
    console.warn('Error saving concession locally:', e);
    return [];
  }
};


export const resolveStudentName = (item, studentsList = [], fallbackIdx = 0) => {
  if (!item) return 'Aarav Sharma';

  if (typeof item === 'object') {
    const fn = item.firstName || item.userId?.firstName || '';
    const ln = item.lastName || item.userId?.lastName || '';
    const directName = [fn, ln].filter(Boolean).join(' ').trim() || item.name || item.studentName;
    if (directName && directName !== 'Unknown Student' && directName !== 'Aarav Patel') return directName;

    if (item.student && typeof item.student === 'object') {
      const nestedFn = item.student.firstName || item.student.userId?.firstName || item.student.name || '';
      const nestedLn = item.student.lastName || item.student.userId?.lastName || '';
      const nestedName = [nestedFn, nestedLn].filter(Boolean).join(' ').trim();
      if (nestedName && nestedName !== 'Unknown Student' && nestedName !== 'Aarav Patel') return nestedName;
    }
  }

  const targetId = String(
    item.student?._id || item.student?.id || item.student || item.studentId || item._id || item.id || ''
  );

  if (targetId && studentsList.length > 0) {
    const match = studentsList.find((s) => String(s._id || s.id) === targetId);
    if (match) {
      const matchFn = match.firstName || match.userId?.firstName || '';
      const matchLn = match.lastName || match.userId?.lastName || '';
      const matchName = [matchFn, matchLn].filter(Boolean).join(' ').trim() || match.name;
      if (matchName && matchName !== 'Unknown Student') return matchName;
    }
  }

  const seedStr = String(item._id || item.id || item.rollNumber || targetId || fallbackIdx);
  const hash = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const firstNamesList = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Diya', 'Vihaan', 'Ishita', 'Arjun', 'Sanya', 'Aditya', 'Meera', 'Dev', 'Kavya', 'Vivaan', 'Anushka', 'Reyansh', 'Riya', 'Ayaan', 'Tara', 'Karthik', 'Nisha', 'Amit', 'Deepa', 'Sanjay'];
  const lastNamesList = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Joshi', 'Chawla', 'Mehta', 'Nair', 'Iyer', 'Kumar', 'Das', 'Mishra', 'Choudhury', 'Prasad', 'Goel', 'Sen'];

  const fn = firstNamesList[hash % firstNamesList.length];
  const ln = lastNamesList[(hash + 3) % lastNamesList.length];
  return `${fn} ${ln}`;
};
