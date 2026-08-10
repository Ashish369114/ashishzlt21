import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Clock, MapPin, Tag, Play, Image as ImageIcon, X, Video, Film, Eye } from 'lucide-react';

const sampleClassroomActivities = [
  // Grade 1 Section A Classroom Activities
  {
    id: 101,
    title: 'Grade 1 Phonics & Alphabet Recitation Activity',
    grade: '1',
    section: 'A',
    className: 'Grade 1 - A',
    subject: 'English',
    date: 'August 1, 2026',
    teacher: 'Ananya Roy',
    description: 'Interactive letter phonics sound storytelling and flashcard recitation activity for Grade 1 students.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    mediaCount: '5 Classroom Photos'
  },
  {
    id: 102,
    title: 'Drawing, Painting & Color Recognition Workshop',
    grade: '1',
    section: 'A',
    className: 'Grade 1 - A',
    subject: 'Art & Craft',
    date: 'July 29, 2026',
    teacher: 'S. Kulkarni',
    description: 'Hands-on finger painting, primary color mixing, and creative animal sketching session for Grade 1 children.',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    mediaCount: '1 HD Activity Video (2 mins)'
  },
  {
    id: 103,
    title: 'Outdoor PE Fun Games & Physical Coordination',
    grade: '1',
    section: 'A',
    className: 'Grade 1 - A',
    subject: 'Sports & PE',
    date: 'July 25, 2026',
    teacher: 'Coach Arjun',
    description: 'Fun obstacle game course and rhythmic coordination drills on the junior school playground.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    mediaCount: '4 Playground Photos'
  },
  // Grade 5 Section A Classroom Activities
  {
    id: 1,
    title: 'Mental Math & Speed Algebra Classroom Competition',
    grade: '5',
    section: 'A',
    className: 'Grade 5 - A',
    subject: 'Mathematics',
    date: 'August 1, 2026',
    teacher: 'Ramesh Sharma',
    description: 'Interactive speed mental quiz and math board calculation challenge conducted during class period.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    mediaCount: '4 High-Res Photos'
  },
  {
    id: 2,
    title: 'Geometry Practical Field Measurement Workshop',
    grade: '5',
    section: 'A',
    className: 'Grade 5 - A',
    subject: 'Mathematics',
    date: 'July 29, 2026',
    teacher: 'Ramesh Sharma',
    description: 'Outdoor practical session where Grade 5 students calculated perimeter, area, and triangle dimensions on school grounds.',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    mediaCount: '1 HD Video (2 mins)'
  },
  {
    id: 3,
    title: 'Science Lab Experiment: Litmus Test & pH Indicators',
    grade: '5',
    section: 'A',
    className: 'Grade 5 - A',
    subject: 'Science',
    date: 'July 24, 2026',
    teacher: 'Sunita Verma',
    description: 'Hands-on chemistry lab experiment testing acidity and alkalinity using natural red cabbage litmus indicators.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    mediaCount: '6 Experiment Photos'
  },
  // Grade 8 Section B Classroom Activities
  {
    id: 4,
    title: 'Physics Mechanics: Pendulum Swing Oscillation Demo',
    grade: '8',
    section: 'B',
    className: 'Grade 8 - B',
    subject: 'Science',
    date: 'August 2, 2026',
    teacher: 'Sunita Verma',
    description: 'Demonstration of harmonic motion and kinetic energy transfer using laboratory pendulum setups.',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    mediaCount: '1 HD Video Clip (3 mins)'
  },
  {
    id: 5,
    title: 'Robotics & STEM AI Model Demonstration',
    grade: '8',
    section: 'B',
    className: 'Grade 8 - B',
    subject: 'Computer Science',
    date: 'July 28, 2026',
    teacher: 'K. Rajesh',
    description: 'Students assembled line-following sensors and programmed microcontrollers in the AI lab.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    mediaCount: '5 Tech Photos'
  }
];

const ParentClassroomActivities = ({ selectedStudentId, student }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const studentGrade = student?.grade || '1';
  const studentSection = student?.section || 'A';
  const studentName = student?.userId?.firstName
    ? `${student.userId.firstName} ${student.userId.lastName || ''}`.trim()
    : (student?.name || 'Child');

  // Filter classroom activities by child's grade & section
  const activities = sampleClassroomActivities.filter(
    (act) => act.grade === String(studentGrade)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Classroom Activity Media
            </span>
          </div>
          <h1 className="text-2xl font-black">{studentName}'s Classroom Activities</h1>
          <p className="text-sky-100 text-xs font-medium">View photos, video demonstrations & practical workshops uploaded for Grade {studentGrade} - Sec {studentSection}.</p>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {activities.map((act) => (
          <div
            key={act.id}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Media Thumbnail Box */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={act.thumbUrl}
                alt={act.title}
                className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-xl bg-[#0C4A86] px-3 py-1 text-xs font-black text-white shadow-xs">
                  {act.className} • {act.subject}
                </span>
              </div>

              {/* Play / Lightbox Icon Trigger */}
              <div className="absolute inset-0 flex items-center justify-center">
                {act.mediaType === 'video' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(act)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl hover:scale-110 transition-all border-2 border-white"
                    title="Play Video"
                  >
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(act)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#0C4A86] shadow-xl hover:scale-110 transition-all backdrop-blur-md"
                    title="Preview Image"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" /> {act.date}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] backdrop-blur-md">
                  {act.mediaType === 'video' ? <Film className="h-3 w-3 text-rose-400" /> : <ImageIcon className="h-3 w-3 text-emerald-400" />} {act.mediaCount}
                </span>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0C4A86] transition-colors">{act.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{act.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Faculty: <strong className="text-slate-800">{act.teacher}</strong></span>
                {act.mediaType === 'video' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(act)}
                    className="text-rose-600 hover:underline font-extrabold flex items-center gap-1"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Watch Video →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(act)}
                    className="text-[#0C4A86] hover:underline font-extrabold flex items-center gap-1"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> View Photo Gallery →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Lightbox Modal (Req 10) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-950 text-white border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">{selectedImage.title}</h3>
                <p className="text-xs text-slate-400 font-semibold">{selectedImage.className} • {selectedImage.subject} • {selectedImage.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-black">
              <img
                src={selectedImage.mediaUrl}
                alt={selectedImage.title}
                className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
              />
            </div>

            <div className="p-4 bg-slate-950 text-xs text-slate-300 font-medium flex items-center justify-between border-t border-slate-800">
              <p>{selectedImage.description}</p>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-200 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal (Req 10) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-950 text-white border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">{selectedVideo.title}</h3>
                <p className="text-xs text-slate-400 font-semibold">{selectedVideo.className} • {selectedVideo.subject} • {selectedVideo.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center">
              <video
                src={selectedVideo.mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[60vh] rounded-2xl shadow-md"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="p-4 bg-slate-950 text-xs text-slate-300 font-medium flex items-center justify-between border-t border-slate-800">
              <p>{selectedVideo.description}</p>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 transition"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentClassroomActivities;
