import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock } from 'lucide-react';
import InteractiveGoogleCalendar from './InteractiveGoogleCalendar';

const sampleUpcomingEvents = [
  {
    id: 1,
    category: 'Holidays',
    badgeColor: 'bg-rose-500 text-white',
    title: 'Independence Day Holiday & Cultural Fest',
    description: 'Flag hoisting ceremony & student patriotic performances.',
    date: 'August 15, 2026',
    time: '08:30 AM - 11:30 AM',
    location: 'Flag Hoisting Ground',
  },
  {
    id: 2,
    category: 'School Events',
    badgeColor: 'bg-emerald-600 text-white',
    title: 'Inter-School Sports Track Championship',
    description: 'Track and field events including 100m sprint, relay & long jump.',
    date: 'August 18, 2026',
    time: '08:00 AM - 04:00 PM',
    location: 'Sports Grounds',
  },
  {
    id: 3,
    category: 'Exams',
    badgeColor: 'bg-amber-600 text-white',
    title: 'Mid-Term Half Yearly Examinations',
    description: 'Mid-Term Evaluation for Grades 6-10 students.',
    date: 'August 25, 2026',
    time: '09:00 AM - 12:30 PM',
    location: 'Exam Halls 1-6',
  },
  {
    id: 4,
    category: 'Parent-Teacher Meetings',
    badgeColor: 'bg-indigo-600 text-white',
    title: 'Q2 Academic Performance & Report Card Distribution',
    description: 'Academic progress discussion between teachers & parents.',
    date: 'August 29, 2026',
    time: '10:00 AM - 01:00 PM',
    location: 'School Classrooms',
  },
  {
    id: 5,
    category: 'Annual Day',
    badgeColor: 'bg-purple-600 text-white',
    title: 'Annual Science & Tech Exhibition 2026',
    description: 'Student project showcase and robotics demonstration.',
    date: 'September 05, 2026',
    time: '09:30 AM - 03:30 PM',
    location: 'Main Auditorium',
  },
];

const CalendarAndEventsSection = () => {
  const [eventsHovered, setEventsHovered] = useState(false);
  const scrollRef = useRef(null);

  // Smooth auto-scroll effect for Upcoming Events
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (eventsHovered) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ top: 70, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [eventsHovered]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'stretch', marginBottom: '28px' }}>
      {/* 7 Columns: Monthly Calendar */}
      <div style={{ gridColumn: 'span 7', maxHeight: '560px', overflowY: 'auto', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <InteractiveGoogleCalendar
          hideCreateEvent={true}
          hideViewToggle={true}
          assignedClassesOnly={false}
        />
      </div>

      {/* 5 Columns: Auto-Scrolling Upcoming Events */}
      <div style={{ gridColumn: 'span 5', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#fff', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: '560px' }}>
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0C4A86' }}>Upcoming Events</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>Important school functions, exams &amp; holidays</p>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '4px 8px', background: '#EBF5FF', color: '#0C4A86', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            ⚡ Auto-Scrolling
          </span>
        </div>

        <div 
          ref={scrollRef}
          onMouseEnter={() => setEventsHovered(true)}
          onMouseLeave={() => setEventsHovered(false)}
          style={{ flex: 1, maxHeight: 'none', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          {sampleUpcomingEvents.map((evt) => (
            <div key={evt.id} style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '14px', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className={evt.badgeColor} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '800' }}>
                  {evt.category}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {evt.date}
                </span>
              </div>

              <h4 style={{ margin: '4px 0 2px', fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{evt.title}</h4>
              <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>{evt.description}</p>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} color="#0096DA" /> {evt.time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: '700' }}>
                  📍 {evt.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarAndEventsSection;
