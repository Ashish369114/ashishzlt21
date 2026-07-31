import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, Search, CheckCircle2, Filter } from 'lucide-react';

const reportCategories = [
  'Attendance Summary',
  'Homework & Submissions',
  'Assignment Status',
  'Examination Marks',
  'Overall Performance',
  'Student Behaviour',
  'Remedial Action Progress',
];

const studentFirstNames = [
  'Rohan', 'Ananya', 'Aarav', 'Ishita', 'Kabir', 'Diya', 'Vihaan', 'Siddharth', 'Riya', 'Karan',
  'Neha', 'Rahul', 'Tanvi', 'Aditya', 'Meera', 'Arjun', 'Pooja', 'Vikram', 'Anushka', 'Devansh',
  'Sneha', 'Harsh', 'Ritu', 'Kunal', 'Sanjana', 'Yash', 'Preeti', 'Gautam', 'Simran', 'Nikhil'
];

const studentLastNames = [
  'Verma', 'Sharma', 'Singh', 'Patel', 'Mehta', 'Kapoor', 'Joshi', 'Rao', 'Sen', 'Nair',
  'Deshmukh', 'Gupta', 'Kulkarni', 'Roy', 'Reddy', 'Bhatt', 'Malhotra', 'Saxena', 'Pandey', 'Iyer',
  'Jain', 'Ahuja', 'Das', 'Agrawal', 'Chowdary', 'Pillai', 'Kaur', 'Saxena', 'Bhatia', 'Menon'
];

// Dynamically generate 30 student records per grade/section
const generateClassReportData = (gradeStr, sectionStr) => {
  const baseRollMap = {
    'Grade 9-A': 901,
    'Grade 9-B': 931,
    'Grade 10-A': 1001,
    'Grade 10-B': 1031,
    'Grade 8-C': 801,
  };
  const base = baseRollMap[`${gradeStr}-${sectionStr}`] || 901;

  return Array.from({ length: 30 }, (_, i) => {
    const fn = studentFirstNames[i % studentFirstNames.length];
    const ln = studentLastNames[(i * 3 + 2) % studentLastNames.length];
    const scoreBase = 74 + ((i * 13) % 24);
    const attendancePct = 90 + (i % 10);

    return {
      studentId: `ADM-2026-${base + i}`,
      name: `${fn} ${ln}`,
      grade: gradeStr,
      section: sectionStr,
      attendance: `${attendancePct}%`,
      homeworkScore: `${Math.min(100, scoreBase + 2)}%`,
      marksAvg: `${scoreBase}%`,
      status: scoreBase >= 90 ? 'Outstanding' : scoreBase >= 80 ? 'Excellent' : scoreBase >= 75 ? 'Good' : 'Satisfactory',
      remedial: i % 7 === 0 ? 'In Progress' : 'None',
      behaviour: i % 6 === 0 ? 'Attentive & Active' : 'Disciplined',
    };
  });
};

const ClassReportsExporter = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('Attendance Summary');
  const [grade, setGrade] = useState('Grade 9');
  const [section, setSection] = useState('A');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically generate 30 students for current grade/section
  const reportDataset = useMemo(() => {
    return generateClassReportData(grade, section);
  }, [grade, section]);

  const filteredData = useMemo(() => {
    return reportDataset.filter(item => {
      const matchQuery = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [reportDataset, searchQuery]);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Student ID,Student Name,Grade,Section,Category,Attendance %,Homework Score,Marks Avg,Status,Remedial Status\n';
    filteredData.forEach(row => {
      csvContent += `${row.studentId},"${row.name}",${row.grade},${row.section},"${selectedCategory}",${row.attendance},${row.homeworkScore},${row.marksAvg},${row.status},${row.remedial}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_Report_${grade}_${section}_${selectedCategory.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#1A1817] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0C4A86]" />
            Class Performance & Analytics Report Generator
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Generate and export comprehensive reports for Ramesh Sharma's assigned classes ({grade} - Section {section})
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 bg-[#0C4A86] hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* Report Filter Controls: Grade + Section + Report Category */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#EBF5FF] p-4 rounded-xl border border-[#BFDBFE] text-xs">
        <div>
          <label className="font-bold text-[#334155] block mb-1">Report Category</label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border border-[#BFDBFE] rounded-lg font-bold text-[#0C4A86] bg-white">
            {reportCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="font-bold text-[#334155] block mb-1">Assigned Grade</label>
          <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2 border border-[#BFDBFE] rounded-lg font-bold text-[#0C4A86] bg-white">
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 8">Grade 8</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-[#334155] block mb-1">Section</label>
          <select value={section} onChange={e => setSection(e.target.value)} className="w-full p-2 border border-[#BFDBFE] rounded-lg font-bold text-[#0C4A86] bg-white">
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-[#334155] block mb-1">Search Student</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name..."
              className="w-full pl-8 pr-3 py-2 border border-[#BFDBFE] rounded-lg font-semibold bg-white"
            />
          </div>
        </div>
      </div>

      {/* Selected Class Filter Status Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs font-bold text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Active Report Context: <span className="font-black text-emerald-950">{selectedCategory}</span> for <span className="font-black text-emerald-950">{grade} - Section {section}</span></span>
        </div>
        <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white font-extrabold">{filteredData.length} Student Records Loaded</span>
      </div>

      {/* Report Data Table for All 30 Students */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-[#0C4A86] text-white font-bold uppercase text-[10px]">
              <th className="p-3 border border-slate-700">Student ID</th>
              <th className="p-3 border border-slate-700">Student Name</th>
              <th className="p-3 border border-slate-700">Grade & Section</th>
              <th className="p-3 border border-slate-700 text-center">Attendance</th>
              <th className="p-3 border border-slate-700 text-center">Homework Score</th>
              <th className="p-3 border border-slate-700 text-center">Exam Average</th>
              <th className="p-3 border border-slate-700 text-center">Status / Rating</th>
              <th className="p-3 border border-slate-700 text-center">Remedial Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-[#EBF5FF] transition-colors">
                  <td className="p-3 border border-slate-200 font-bold text-[#0C4A86]">{row.studentId}</td>
                  <td className="p-3 border border-slate-200 font-extrabold text-[#0C4A86]">{row.name}</td>
                  <td className="p-3 border border-slate-200 text-[#334155] font-semibold">{row.grade} - {row.section}</td>
                  <td className="p-3 border border-slate-200 text-center font-extrabold text-emerald-700">{row.attendance}</td>
                  <td className="p-3 border border-slate-200 text-center font-bold">{row.homeworkScore}</td>
                  <td className="p-3 border border-slate-200 text-center font-extrabold text-[#0C4A86]">{row.marksAvg}</td>
                  <td className="p-3 border border-slate-200 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 border border-slate-200 text-center text-[#334155]">{row.remedial}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-6 text-center text-xs font-semibold text-slate-500">
                  No student report records found for {grade} - Section {section}. Select another grade/section above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassReportsExporter;
