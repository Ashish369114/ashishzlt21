// Realtime Sync Service across Portals (Teacher, Principal, Super Admin, Accountant, AO, Librarian, Examiner, Parent, Student)

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

    apiStudents.forEach((s) => {
      const id = s._id || s.id;
      if (id) combinedMap.set(String(id), s);
    });

    localSaved.forEach((s) => {
      const id = s._id || s.id;
      if (id) combinedMap.set(String(id), s);
    });

    return Array.from(combinedMap.values());
  } catch (e) {
    return apiStudents;
  }
};

export const resolveStudentName = (item, studentsList = [], fallbackIdx = 0) => {
  const fallbackNames = ['Aarav Sharma', 'Ananya Verma', 'Vihaan Patel', 'Ishaan Gupta', 'Diya Singh', 'Rohan Mehta', 'Sanya Kapoor', 'Aditya Kumar'];
  
  if (!item) return fallbackNames[fallbackIdx % fallbackNames.length];

  if (typeof item === 'object') {
    const fn = item.firstName || item.userId?.firstName || '';
    const ln = item.lastName || item.userId?.lastName || '';
    const directName = [fn, ln].filter(Boolean).join(' ').trim() || item.name || item.studentName;
    if (directName && directName !== 'Unknown Student') return directName;

    if (item.student && typeof item.student === 'object') {
      const nestedFn = item.student.firstName || item.student.userId?.firstName || item.student.name || '';
      const nestedLn = item.student.lastName || item.student.userId?.lastName || '';
      const nestedName = [nestedFn, nestedLn].filter(Boolean).join(' ').trim();
      if (nestedName && nestedName !== 'Unknown Student') return nestedName;
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
      if (matchName) return matchName;
    }
  }

  return fallbackNames[fallbackIdx % fallbackNames.length];
};
