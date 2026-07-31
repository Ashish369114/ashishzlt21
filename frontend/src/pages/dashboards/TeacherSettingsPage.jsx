import React, { useState, useRef } from 'react';
import { User, Camera, Lock, Save, KeyRound, ShieldCheck } from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';

const TeacherSettingsPage = ({ user }) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || 'Ramesh',
    lastName: user?.lastName || 'Sharma',
    email: user?.email || 'ramesh.sharma@school.edu',
    phone: user?.phone || '+91 98765 43210',
    subject: user?.subject || 'Mathematics & Statistics',
    assignedClasses: 'Grade 9-A, 10-B',
    employeeId: 'TCH-2026-88',
    qualification: 'M.Sc. Mathematics, B.Ed',
    experience: '8 Years Teaching Experience',
    bio: 'Senior Mathematics Faculty focused on algebra and analytical problem solving.',
    address: 'Faculty Quarters B-12, School Campus, Main Road',
  });

  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem('teacherProfileImage') || ''
  );
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        setProfilePhoto(base64Url);
        localStorage.setItem('teacherProfileImage', base64Url);
        setProfileSuccessMsg('Profile photo updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ ...user, ...profileForm }));
    setProfileSuccessMsg('Profile details saved successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!passwordForm.currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      return;
    }

    setPasswordSuccessMsg('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF5FF] px-3.5 py-1 text-xs font-bold text-[#0C4A86] border border-[#BFDBFE] mb-2">
            <User className="h-3.5 w-3.5 text-[#0096DA]" /> Teacher Account & Security Settings
          </div>
          <h1 className="text-2xl font-black text-[#0C4A86]">Settings & Profile</h1>
          <p className="text-xs font-semibold text-slate-600">
            Manage your personal profile info, profile avatar, and account security.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 bg-[#EBF5FF] p-1.5 rounded-2xl border border-[#BFDBFE]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'profile'
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'text-[#0C4A86] hover:bg-sky-100'
            }`}
          >
            <User className="h-4 w-4" /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'password'
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'text-[#0C4A86] hover:bg-sky-100'
            }`}
          >
            <Lock className="h-4 w-4" /> Change Password
          </button>
        </div>
      </div>

      {/* Edit Profile Tab */}
      {activeTab === 'profile' && (
        <SectionCard title="Personal Profile Information" subtitle="Update your contact info and qualifications">
          {profileSuccessMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
              ✓ {profileSuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Profile Avatar Upload */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl border border-[#BFDBFE] bg-[#EBF5FF]">
              <div className="relative group h-28 w-28 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] shadow-md border-4 border-white flex items-center justify-center text-white font-black text-3xl">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{profileForm.firstName?.[0] || 'T'}</span>
                )}
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="mt-4 rounded-xl border border-[#BFDBFE] bg-white px-3.5 py-2 text-xs font-bold text-[#0C4A86] hover:bg-[#EBF5FF]"
              >
                Upload New Photo
              </button>
            </div>

            {/* Right Profile Form */}
            <form onSubmit={handleSaveProfile} className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">Subject / Specialization</label>
                  <input
                    type="text"
                    name="subject"
                    value={profileForm.subject}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">Assigned Classes</label>
                  <input
                    type="text"
                    name="assignedClasses"
                    value={profileForm.assignedClasses}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0C4A86]">Qualifications & Bio</label>
                <textarea
                  rows="3"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </SectionCard>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <SectionCard title="Security & Password" subtitle="Update account password for maximum security">
          {passwordErrorMsg && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
              ⚠️ {passwordErrorMsg}
            </div>
          )}
          {passwordSuccessMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
              ✓ {passwordSuccessMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="max-w-xl space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0C4A86]">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePwChange}
                required
                className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0C4A86]">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePwChange}
                required
                className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0C4A86]">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePwChange}
                required
                className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
              >
                <KeyRound className="h-4 w-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </SectionCard>
      )}
    </div>
  );
};

export default TeacherSettingsPage;
