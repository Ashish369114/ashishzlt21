import React, { useState, useRef } from 'react';
import { User, Camera, Lock, Save, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';

const TeacherSettingsPage = ({ user }) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  const userRole = user?.role || localStorage.getItem('role') || 'teacher';

  const getRoleConfig = (r) => {
    switch (r) {
      case 'principal':
        return {
          badgeText: 'Principal Account & Executive Security Settings',
          roleTitle: 'Principal / Head of Institution',
          field1Label: 'Department / Designation',
          field1Default: 'Executive Leadership & Administration',
          field2Label: 'Assigned Supervision & Duties',
          field2Default: 'All Academic Faculties & School Operations',
          bioDefault: 'School Principal & Chief Administrative Officer overseeing academic excellence and institutional growth.',
          defaultName: { first: 'Dr. Rajesh', last: 'Sharma' },
          defaultEmail: 'principal@school.edu',
          defaultPhone: '+91 98765 00001',
          photoKey: 'principalProfileImage'
        };
      case 'super_admin':
        return {
          badgeText: 'Super Admin Account & Master Governance Settings',
          roleTitle: 'Super Administrator',
          field1Label: 'System Access Level',
          field1Default: 'Full System Control & Root Privileges',
          field2Label: 'Administrative Domain',
          field2Default: 'Multi-Branch Network & Platform Infrastructure',
          bioDefault: 'Master System Administrator responsible for global configurations, security compliance, and user roles.',
          defaultName: { first: 'Vikram', last: 'Aditya' },
          defaultEmail: 'admin@zaynlevi.edu',
          defaultPhone: '+91 98765 99999',
          photoKey: 'adminProfileImage'
        };
      case 'accountant':
      case 'accountant_admin':
        return {
          badgeText: 'Accountant Account & Financial Security Settings',
          roleTitle: 'Chief Accountant & Finance Manager',
          field1Label: 'Department / Specialization',
          field1Default: 'Finance, Payroll & Fee Collections',
          field2Label: 'Assigned Duties',
          field2Default: 'Fee Auditing, Expense Tracking & Ledger Management',
          bioDefault: 'Senior Accountant managing school finances, fee structures, payroll generation, and financial compliance.',
          defaultName: { first: 'Vikram', last: 'Malhotra' },
          defaultEmail: 'accountant@school.edu',
          defaultPhone: '+91 98765 44321',
          photoKey: 'accountantProfileImage'
        };
      case 'examiner':
        return {
          badgeText: 'Examiner Account & Assessment Security Settings',
          roleTitle: 'Head Examiner & Assessment In-Charge',
          field1Label: 'Specialization / Department',
          field1Default: 'Examination & Curriculum Evaluation',
          field2Label: 'Assigned Duties',
          field2Default: 'Question Bank Setup, Grading & Result Moderation',
          bioDefault: 'Lead Examination Controller overseeing mid-term/final evaluations and grade sheet generation.',
          defaultName: { first: 'Dr. Sunita', last: 'Deshmukh' },
          defaultEmail: 'examiner@school.edu',
          defaultPhone: '+91 98765 55432',
          photoKey: 'examinerProfileImage'
        };
      case 'librarian':
        return {
          badgeText: 'Librarian Account & Catalog Management Settings',
          roleTitle: 'Chief Librarian & Information Specialist',
          field1Label: 'Specialization / Department',
          field1Default: 'Library Sciences & Resource Archiving',
          field2Label: 'Assigned Duties',
          field2Default: 'Cataloging, Issue/Return Portal & Periodicals',
          bioDefault: 'Head Librarian managing physical and digital library collections, barcode cataloging, and reading programs.',
          defaultName: { first: 'Mr. Anand', last: 'Kulkarni' },
          defaultEmail: 'librarian@school.edu',
          defaultPhone: '+91 98765 66543',
          photoKey: 'librarianProfileImage'
        };
      case 'student':
        return {
          badgeText: 'Student Account & Learning Settings',
          roleTitle: 'Enrolled Student',
          field1Label: 'Current Class & Section',
          field1Default: 'Grade 10 - Section A',
          field2Label: 'Roll Number & Admission ID',
          field2Default: 'Roll No: 12 • ADM-2026-104',
          bioDefault: 'Enthusiastic high school student focused on STEM subjects, mathematics, and extracurricular activities.',
          defaultName: { first: 'Aarav', last: 'Patel' },
          defaultEmail: 'aarav.patel@student.school.edu',
          defaultPhone: '+91 98765 11223',
          photoKey: 'studentProfileImage'
        };
      case 'ao':
      case 'admin_officer':
      case 'administrative_officer':
        return {
          badgeText: 'Administrative Officer Account & Infrastructure Settings',
          roleTitle: 'Administrative Officer (AO In-Charge)',
          field1Label: 'Department / Designation',
          field1Default: 'School Infrastructure & Operations Management',
          field2Label: 'Assigned Duties',
          field2Default: 'Staff Coordination, Vendor Contracts & Maintenance Orders',
          bioDefault: 'Senior Administrative Officer overseeing school infrastructure, asset management, vendor contracts, and day-to-day operations.',
          defaultName: { first: 'Vikram', last: 'Rathore' },
          defaultEmail: 'ao@school.edu',
          defaultPhone: '+91 98765 33210',
          photoKey: 'aoProfileImage'
        };
      default:
        return {
          badgeText: 'Teacher Account & Security Settings',
          roleTitle: 'Senior Teacher',
          field1Label: 'Subject / Specialization',
          field1Default: 'Mathematics & Statistics',
          field2Label: 'Assigned Classes',
          field2Default: 'Grade 9-A, 10-B',
          bioDefault: 'Senior Mathematics Faculty focused on algebra and analytical problem solving.',
          defaultName: { first: 'Ramesh', last: 'Sharma' },
          defaultEmail: 'ramesh.sharma@school.edu',
          defaultPhone: '+91 98765 43210',
          photoKey: 'teacherProfileImage'
        };
    }
  };

  const roleConfig = getRoleConfig(userRole);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || roleConfig.defaultName.first,
    lastName: user?.lastName || roleConfig.defaultName.last,
    email: user?.email || roleConfig.defaultEmail,
    phone: user?.phone || roleConfig.defaultPhone,
    field1: user?.subject || roleConfig.field1Default,
    field2: user?.assignedClasses || roleConfig.field2Default,
    bio: user?.bio || roleConfig.bioDefault,
    address: user?.address || 'Faculty Quarters B-12, School Campus, Main Road',
  });

  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem(roleConfig.photoKey) || localStorage.getItem('userProfileImage') || ''
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
        localStorage.setItem(roleConfig.photoKey, base64Url);
        localStorage.setItem('userProfileImage', base64Url);
        setProfileSuccessMsg('Profile photo updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    localStorage.removeItem(roleConfig.photoKey);
    localStorage.removeItem('userProfileImage');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setProfileSuccessMsg('Profile photo removed successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
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
            <User className="h-3.5 w-3.5 text-[#0096DA]" /> {roleConfig.badgeText}
          </div>
          <h1 className="text-2xl font-black text-[#0C4A86]">Settings & Profile</h1>
          <p className="text-xs font-semibold text-slate-600">
            Manage your personal profile info, avatar, and account security credentials.
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

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="rounded-xl border border-[#BFDBFE] bg-white px-3.5 py-2 text-xs font-bold text-[#0C4A86] hover:bg-[#EBF5FF] transition"
                >
                  Upload New Photo
                </button>
                {profilePhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Photo
                  </button>
                )}
              </div>
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
                  <label className="text-xs font-bold text-[#0C4A86]">{roleConfig.field1Label}</label>
                  <input
                    type="text"
                    name="field1"
                    value={profileForm.field1}
                    onChange={handleProfileChange}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0C4A86]">{roleConfig.field2Label}</label>
                  <input
                    type="text"
                    name="field2"
                    value={profileForm.field2}
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
