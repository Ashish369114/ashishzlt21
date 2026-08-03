import React, { useState, useRef } from 'react';
import { MessageCircleMore, Search, User, Camera } from 'lucide-react';
import NotificationDrawer from '../common/NotificationDrawer';

const roleAvatars = {
  superadmin: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  super_admin: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  principal: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  accountant: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
  examiner: 'https://images.unsplash.com/photo-1580894732413-80f2d9c18db1?auto=format&fit=crop&q=80&w=256',
  administrative_officer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  ao: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  teacher: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256',
  student: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=256',
  parent: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
};

const TopBar = ({ userName = 'Ramesh Sharma', subject = 'Mathematics', onOpenMessages, user }) => {
  const roleSlug = (user?.role || subject || userName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userSlug = (user?._id || user?.id || userName || 'user').toString().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const storageKey = `profileImage_${roleSlug}_${userSlug}`;

  const defaultAvatar = roleAvatars[roleSlug] || roleAvatars[user?.role] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256';

  const [profileImage, setProfileImage] = useState(
    () => localStorage.getItem(storageKey) || localStorage.getItem(`profileImage_${roleSlug}`) || ''
  );
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        setProfileImage(base64Url);
        localStorage.setItem(storageKey, base64Url);
        localStorage.setItem(`profileImage_${roleSlug}`, base64Url);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="flex items-center justify-between rounded-2xl border border-[#BFDBFE] bg-white px-6 py-3.5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="min-w-[340px]">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400"><Search className="h-4 w-4" /></span>
            <input aria-label="Search" className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] py-2 pl-10 pr-4 text-sm text-[#0C4A86] placeholder:text-slate-400 focus:border-[#0096DA] focus:outline-none" placeholder="Search classes, students, tasks, activities..." />
          </label>
        </div>

        <div className="hidden md:flex items-center gap-2.5 text-xs font-semibold text-slate-600">
          <span className="px-3 py-1.5 rounded-xl bg-[#EBF5FF] text-[#0C4A86] font-bold border border-[#BFDBFE]">Academic Year 2026-27</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDrawer user={user} />
        <button onClick={onOpenMessages} className="relative rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-[#0C4A86] transition hover:bg-sky-100" title="Messages">
          <MessageCircleMore className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#0096DA]" />
        </button>

        {/* Teacher Profile Info & Avatar Upload (Settings button removed) */}
        <div className="ml-2 flex items-center gap-3 rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={handleImageClick}
            className="relative group flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] text-white font-bold transition hover:opacity-90"
            title="Click to upload or change profile image"
          >
            <img src={profileImage || defaultAvatar} alt="Profile" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </button>
          
          <div className="text-xs">
            <p className="font-extrabold text-[#0C4A86] leading-tight">{userName || 'Ramesh Sharma'}</p>
            <p className="text-[11px] font-bold text-[#0096DA]">{subject}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
