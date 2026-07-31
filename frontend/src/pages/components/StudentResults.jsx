import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, TrendingUp, Download, Eye, ChevronDown, Filter, Search, BookOpen } from 'lucide-react';
import { marksService } from '../../services/api';
import ReportCardModal from '../../components/common/ReportCardModal';

const StudentResults = ({ userId, user, student }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('my_finals');
  const [searchSubject, setSearchSubject] = useState('');

  useEffect(() => {
    const loadMarks = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await marksService.getByStudent(userId);
        setMarks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching marks:', err);
        setMarks([]);
      } finally {
        setLoading(false);
      }
    };

    loadMarks();
  }, [userId]);

  // Categorized Result Datasets
  const categoryDatasets = {
    my_finals: [
      { subject: { name: 'Mathematics' }, marks: 95, maxMarks: 100, examType: 'My Finals', grade: 'A+', comment: 'Outstanding conceptual problem solving.' },
      { subject: { name: 'Physics' }, marks: 91, maxMarks: 100, examType: 'My Finals', grade: 'A+', comment: 'Excellent performance in numerical questions.' },
      { subject: { name: 'Chemistry' }, marks: 88, maxMarks: 100, examType: 'My Finals', grade: 'A', comment: 'Strong understanding of organic reactions.' },
      { subject: { name: 'English Literature' }, marks: 96, maxMarks: 100, examType: 'My Finals', grade: 'A+', comment: 'Brilliant essay writing & analysis.' },
      { subject: { name: 'Computer Science' }, marks: 99, maxMarks: 100, examType: 'My Finals', grade: 'A+', comment: 'Flawless code logic & algorithm efficiency.' },
      { subject: { name: 'Social Studies' }, marks: 90, maxMarks: 100, examType: 'My Finals', grade: 'A+', comment: 'Comprehensive historical event timeline.' },
    ],
    mid_terms: [
      { subject: { name: 'Mathematics' }, marks: 89, maxMarks: 100, examType: 'Mid-Term Exam', grade: 'A', comment: 'Good work on algebraic equations.' },
      { subject: { name: 'Physics' }, marks: 85, maxMarks: 100, examType: 'Mid-Term Exam', grade: 'A', comment: 'Solid optics & motion basics.' },
      { subject: { name: 'Chemistry' }, marks: 82, maxMarks: 100, examType: 'Mid-Term Exam', grade: 'A', comment: 'Clear periodic trends understanding.' },
      { subject: { name: 'English Literature' }, marks: 92, maxMarks: 100, examType: 'Mid-Term Exam', grade: 'A+', comment: 'Great poetry analysis.' },
      { subject: { name: 'Computer Science' }, marks: 95, maxMarks: 100, examType: 'Mid-Term Exam', grade: 'A+', comment: 'Excellent Python syntax.' },
      { subject: { name: 'Social Studies' }, marks: 87, maxMarks: 100, examType: 'Mid-Term Exam', grade: 'A', comment: 'Good geography answers.' },
    ],
    unit_tests: [
      { subject: { name: 'Mathematics' }, marks: 20, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', comment: 'Perfect score in Algebra Quiz.' },
      { subject: { name: 'Physics' }, marks: 18, maxMarks: 20, examType: 'Unit Test 1', grade: 'A', comment: 'Great speed & accuracy.' },
      { subject: { name: 'Chemistry' }, marks: 19, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', comment: 'Excellent chemical equations.' },
      { subject: { name: 'English Literature' }, marks: 19, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', comment: 'Clear grammar usage.' },
      { subject: { name: 'Computer Science' }, marks: 20, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', comment: 'Perfect algorithm test.' },
    ],
    class_tests: [
      { subject: { name: 'Mathematics' }, marks: 48, maxMarks: 50, examType: 'Class Practice Test', grade: 'A+', comment: 'Very diligent performance.' },
      { subject: { name: 'Physics' }, marks: 44, maxMarks: 50, examType: 'Class Practice Test', grade: 'A', comment: 'Keen analytical thinking.' },
      { subject: { name: 'Chemistry' }, marks: 46, maxMarks: 50, examType: 'Class Practice Test', grade: 'A+', comment: 'Lab safety & quiz champion.' },
      { subject: { name: 'Computer Science' }, marks: 50, maxMarks: 50, examType: 'Class Practice Test', grade: 'A+', comment: 'Full marks in coding test.' },
    ],
  };

  // Combine database marks with defaults
  const getRawCategoryMarks = () => {
    if (marks.length > 0) {
      if (selectedCategory === 'all') return marks;
      const filtered = marks.filter((m) => {
        const type = (m.examType || '').toLowerCase();
        if (selectedCategory === 'my_finals') return type.includes('final');
        if (selectedCategory === 'mid_terms') return type.includes('mid') || type.includes('term');
        if (selectedCategory === 'unit_tests') return type.includes('unit') || type.includes('quiz');
        if (selectedCategory === 'class_tests') return type.includes('class') || type.includes('test');
        return true;
      });
      return filtered.length > 0 ? filtered : marks;
    }

    if (selectedCategory === 'all') {
      return [
        ...categoryDatasets.my_finals,
        ...categoryDatasets.mid_terms,
        ...categoryDatasets.unit_tests,
        ...categoryDatasets.class_tests,
      ];
    }
    return categoryDatasets[selectedCategory] || categoryDatasets.my_finals;
  };

  const activeCategoryMarks = getRawCategoryMarks();

  // Search filter
  const displayedMarks = activeCategoryMarks.filter((item) => {
    const name = typeof item.subject === 'object' ? item.subject?.name : item.subject;
    return (name || '').toLowerCase().includes(searchSubject.toLowerCase());
  });

  const totalObtained = displayedMarks.reduce((sum, item) => sum + Number(item.marks || 0), 0);
  const totalMax = displayedMarks.reduce((sum, item) => sum + Number(item.maxMarks || 100), 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  const getGradeBadge = (score, max = 100) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 80) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (pct >= 70) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <Award className="h-3.5 w-3.5" /> Student Performance Center
          </div>
          <h1 className="text-2xl font-bold">Results & Examination Scorecards</h1>
          <p className="text-emerald-100 text-sm">Select a category below to view specific term marks and detailed subject reports.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-md hover:bg-emerald-50 transition-all self-start md:self-auto"
        >
          <Eye className="h-4 w-4" /> Official Report Card
        </button>
      </div>

      {/* Category Dropdown & Search Controls Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Dropdown Menu */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-4 w-4 text-emerald-600" /> Result Category:
          </label>
          <div className="relative w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-extrabold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="my_finals">🏆 My Finals (Final Term)</option>
              <option value="mid_terms">📝 Mid-Term Examinations</option>
              <option value="unit_tests">🎯 Unit Tests & Quizzes</option>
              <option value="class_tests">✏️ Class Tests & Practice</option>
              <option value="all">📊 All Examinations Combined</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Subject Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject..."
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Category Score Average</p>
          <p className="text-3xl font-extrabold text-slate-900">{percentage}%</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> High Academic Standing
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Marks Obtained</p>
          <p className="text-3xl font-extrabold text-slate-900">{totalObtained} / {totalMax}</p>
          <p className="text-xs text-slate-500">{displayedMarks.length} Subjects Evaluated</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Class Rank / Rating</p>
          <p className="text-3xl font-extrabold text-emerald-600">Top 3%</p>
          <p className="text-xs text-slate-500">Grade 10 Section A</p>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" /> Subject Results Breakdown
          </h3>
          <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold px-3 py-1 text-xs">
            {displayedMarks.length} Subjects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-l-2xl">Subject</th>
                <th className="p-4 font-bold">Exam Category</th>
                <th className="p-4 font-bold">Marks Scored</th>
                <th className="p-4 font-bold">Progress</th>
                <th className="p-4 font-bold">Grade</th>
                <th className="p-4 font-bold rounded-r-2xl">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMarks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No results found for this category or search query.
                  </td>
                </tr>
              ) : (
                displayedMarks.map((item, idx) => {
                  const subjectName = typeof item.subject === 'object' ? item.subject?.name : item.subject;
                  const scored = Number(item.marks || 0);
                  const max = Number(item.maxMarks || 100);
                  const pct = max > 0 ? (scored / max) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{subjectName}</td>
                      <td className="p-4 text-xs font-medium text-slate-500">{item.examType || 'Final Term'}</td>
                      <td className="p-4 font-bold text-slate-800">{scored} / {max}</td>
                      <td className="p-4 w-36">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 80 ? 'bg-blue-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{pct.toFixed(0)}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${getGradeBadge(scored, max)}`}>
                          {item.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : 'B')}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-600 max-w-xs">{item.comment || 'Good progress.'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Modal */}
      <ReportCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentData={{
          name: `${user?.firstName || 'Student'} ${user?.lastName || ''}`,
          rollNo: student?.rollNumber || '101',
          grade: student?.class?.grade || 'Grade 10',
          section: student?.class?.section || 'A',
        }}
        marksData={displayedMarks}
        attendancePct={96}
      />
    </div>
  );
};

export default StudentResults;
