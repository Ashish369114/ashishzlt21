/**
 * Unified Multi-Role Communication & Messaging Data Store
 * Provides persistent messaging between Principal, Teachers, Students, and Parents.
 */

const initialMessagesList = [
  {
    id: 'msg_101',
    senderRole: 'Student',
    senderName: 'Rohan Verma',
    senderId: 's_Grade9_A_1',
    targetRole: 'Teacher',
    targetName: 'Ramesh Sharma',
    targetId: 'tch_01',
    className: 'Grade 9 - A',
    subject: 'Mathematics Homework Question Doubt',
    category: 'Academic Doubt',
    date: '2026-08-01T09:15:00.000Z',
    dateFormatted: 'Today, 09:15 AM',
    unread: true,
    thread: [
      {
        id: 't_1',
        senderName: 'Rohan Verma',
        senderRole: 'Student',
        text: 'Hello Sir, I have a doubt about today\'s Mathematics homework on Quadratic Equations. Could you please explain Question 5 on page 42?',
        timestamp: '09:15 AM',
        attachment: null,
      },
    ],
  },
  {
    id: 'msg_102',
    senderRole: 'Parent',
    senderName: 'Suresh Verma (Parent of Rohan)',
    senderId: 'pr_Grade9_A_1',
    targetRole: 'Teacher',
    targetName: 'Ramesh Sharma',
    targetId: 'tch_01',
    className: 'Grade 9 - A',
    subject: 'Query Regarding Term 1 Attendance & Unit Test 1 Result',
    category: 'Parent Query',
    date: '2026-07-31T14:30:00.000Z',
    dateFormatted: 'Yesterday, 02:30 PM',
    unread: true,
    thread: [
      {
        id: 't_2',
        senderName: 'Suresh Verma',
        senderRole: 'Parent',
        text: 'Respected Ramesh Sir, we noticed Rohan scored 18/20 in Unit Test 1. We would like to request extra practice worksheets for his weaker chapters.',
        timestamp: '02:30 PM',
        attachment: { fileName: 'unit_test_query.pdf', fileType: 'PDF Document' },
      },
      {
        id: 't_3',
        senderName: 'Ramesh Sharma',
        senderRole: 'Teacher',
        text: 'Dear Mr. Suresh, Rohan is performing very well. I have shared supplementary geometry and algebra worksheets in his study notes section.',
        timestamp: '04:10 PM',
        attachment: null,
      },
    ],
  },
  {
    id: 'msg_103',
    senderRole: 'Principal',
    senderName: 'Dr. Anita Roy (Principal)',
    senderId: 'principal_01',
    targetRole: 'Teacher',
    targetName: 'Ramesh Sharma',
    targetId: 'tch_01',
    className: 'All Assigned Classes',
    subject: 'Submission Deadline for Mid-Term 1 Exam Papers',
    category: 'Principal Notice',
    date: '2026-07-30T10:00:00.000Z',
    dateFormatted: 'Jul 30, 2026',
    unread: false,
    thread: [
      {
        id: 't_4',
        senderName: 'Dr. Anita Roy',
        senderRole: 'Principal',
        text: 'Dear Ramesh, please ensure all Mathematics question papers for Mid-Term 1 are finalized and uploaded by August 10th.',
        timestamp: '10:00 AM',
        attachment: { fileName: 'Exam_Guidelines_2026.pdf', fileType: 'PDF Document' },
      },
    ],
  },
];

const getStorageItem = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('messagesUpdated'));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};

export const unifiedCommunicationService = {
  // Get all messages
  getAllMessages: () => {
    return getStorageItem('school_messages_list', initialMessagesList);
  },

  // Get messages for current active user role
  getMessagesForRole: (userRole, userName) => {
    const all = unifiedCommunicationService.getAllMessages();
    return all.filter((msg) => {
      // Role matching
      if (userRole === 'Teacher') {
        return msg.targetRole === 'Teacher' || msg.senderRole === 'Teacher';
      }
      if (userRole === 'Student') {
        return (msg.targetRole === 'Student' || msg.senderRole === 'Student') && (msg.senderName.includes(userName) || msg.targetName.includes(userName) || true);
      }
      if (userRole === 'Parent') {
        return msg.targetRole === 'Parent' || msg.senderRole === 'Parent';
      }
      if (userRole === 'Principal') {
        return true; // Principal sees all communications
      }
      return true;
    });
  },

  // Send a new message thread
  sendMessage: (messageData) => {
    const all = unifiedCommunicationService.getAllMessages();
    const newMsg = {
      id: `msg_${Date.now()}`,
      date: new Date().toISOString(),
      dateFormatted: 'Just Now',
      unread: true,
      thread: [
        {
          id: `t_${Date.now()}`,
          senderName: messageData.senderName,
          senderRole: messageData.senderRole,
          text: messageData.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: messageData.attachment || null,
        },
      ],
      ...messageData,
    };

    const updated = [newMsg, ...all];
    setStorageItem('school_messages_list', updated);
    return newMsg;
  },

  // Reply to an existing thread
  replyToThread: (msgId, replyData) => {
    const all = unifiedCommunicationService.getAllMessages();
    const updated = all.map((msg) => {
      if (msg.id === msgId) {
        const newReply = {
          id: `t_${Date.now()}`,
          senderName: replyData.senderName,
          senderRole: replyData.senderRole,
          text: replyData.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: replyData.attachment || null,
        };
        return {
          ...msg,
          unread: false,
          dateFormatted: 'Just Now',
          thread: [...msg.thread, newReply],
        };
      }
      return msg;
    });

    setStorageItem('school_messages_list', updated);
  },

  // Mark message as read
  markAsRead: (msgId) => {
    const all = unifiedCommunicationService.getAllMessages();
    const updated = all.map((m) => (m.id === msgId ? { ...m, unread: false } : m));
    setStorageItem('school_messages_list', updated);
  },

  // Unread count for role
  getUnreadCountForRole: (userRole) => {
    const messages = unifiedCommunicationService.getMessagesForRole(userRole, '');
    return messages.filter((m) => m.unread && m.targetRole === userRole).length;
  },
};
