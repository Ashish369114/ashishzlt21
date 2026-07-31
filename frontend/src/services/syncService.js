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
