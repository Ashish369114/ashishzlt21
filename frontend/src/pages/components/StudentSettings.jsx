import React, { useState } from 'react';
import { Settings, User, Lock, Mail, Phone, Bell, CheckCircle2, Camera } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';

const StudentSettings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [email, setEmail] = useState(user?.email || 'rohan.verma@school.edu');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [bio, setBio] = useState('Enthusiastic Grade 9 student passionate about Mathematics, Robotics & Science.');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [profileAvatar, setProfileAvatar] = useState(() => {
    return localStorage.getItem('student_profile_avatar') || null;
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setProfileAvatar(base64Data);
        localStorage.setItem('student_profile_avatar', base64Data);
        window.dispatchEvent(new Event('storage'));
        setSuccessMsg('Profile picture updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMsg('Profile settings and notification preferences updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md mb-2">
            <Settings className="h-3.5 w-3.5 text-sky-200" /> Account Management & Security
          </div>
          <h1 className="text-2xl font-black text-white">Account Settings</h1>
          <p className="text-xs font-semibold text-sky-100">
            Manage profile information, avatar photo, notifications, and security password.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 self-start md:self-auto backdrop-blur-md">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'profile'
                ? 'bg-white text-[#0C4A86] shadow-xs'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" /> Profile Settings
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'password'
                ? 'bg-white text-[#0C4A86] shadow-xs'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4" /> Change Password
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#BFDBFE] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">Profile Information</h3>
              <p className="text-xs font-semibold text-[#736B63]">Update contact info, profile photo avatar, and bio.</p>
            </div>

            {/* Avatar Uploader in Settings */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C4A86] text-white font-black overflow-hidden border-2 border-white shadow-xs">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Student Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>R</span>
                )}
              </div>
              <label
                htmlFor="settings-photo-upload"
                className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3 py-1.5 text-xs font-bold text-[#0C4A86] hover:bg-[#EFEAE4]"
              >
                <Camera className="h-3.5 w-3.5 text-[#0096DA]" />
                <span>Upload Photo</span>
                <input
                  id="settings-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-semibold">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[#334155] mb-1 font-bold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#0096DA]" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-[#0C4A86] font-bold focus:outline-none focus:border-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-[#334155] mb-1 font-bold flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#0096DA]" /> Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-[#0C4A86] font-bold focus:outline-none focus:border-[#0C4A86]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#334155] mb-1 font-bold">Student Bio / Statement</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-[#0C4A86] font-bold focus:outline-none focus:border-[#0C4A86]"
              />
            </div>

            <div className="border-t border-[#BFDBFE] pt-5 space-y-3">
              <h4 className="font-black text-[#0C4A86] text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#0C4A86]" /> Notification Preferences
              </h4>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE]">
                <div>
                  <p className="font-extrabold text-[#0C4A86]">Email Alerts</p>
                  <p className="text-[11px] font-semibold text-[#736B63]">Receive homework postings, exam datesheets & result alerts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#0C4A86]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE]">
                <div>
                  <p className="font-extrabold text-[#0C4A86]">SMS Broadcast Reminders</p>
                  <p className="text-[11px] font-semibold text-[#736B63]">Receive urgent school closures and principal notices via SMS.</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#0C4A86]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="rounded-xl bg-[#0C4A86] px-6 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-black transition"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-[#BFDBFE] pb-4">
            <h3 className="text-lg font-black text-[#0C4A86]">Change Password</h3>
            <p className="text-xs font-semibold text-[#736B63]">Update your account password. Password updates are stored securely.</p>
          </div>

          <PasswordChangeForm />
        </div>
      )}
    </div>
  );
};

export default StudentSettings;
