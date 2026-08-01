import React, { useRef } from 'react';
import { X, Printer, Download, Award, UserCheck } from 'lucide-react';

const ReportCardModal = ({ isOpen, onClose, studentData, marksData = [], attendancePct = 96, examName = 'Examination Report Card' }) => {
  const printRef = useRef(null);

  if (!isOpen || !studentData) return null;

  const studentName = studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Aro Patel';
  const rollNumber = studentData.rollNumber || studentData.rollNo || '901';
  const grade = studentData.grade || studentData.className || 'Grade 9';
  const section = studentData.section || 'A';
  const academicYear = '2026-2027';

  // Format subject-wise marks based on passed marksData
  const subjects = marksData.length > 0 ? marksData.map(m => ({
    subject: m.subject || m.subjectName || 'Subject',
    maxMarks: m.maxMarks || m.totalMarks || 100,
    obtainedMarks: m.marks || m.obtainedMarks || 0,
    grade: m.grade || 'A+',
    status: m.status || 'Pass',
  })) : [
    { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 92, grade: 'A+', status: 'Pass' },
    { subject: 'Physics', maxMarks: 100, obtainedMarks: 88, grade: 'A', status: 'Pass' },
    { subject: 'Chemistry', maxMarks: 100, obtainedMarks: 89, grade: 'A+', status: 'Pass' },
    { subject: 'English Literature', maxMarks: 100, obtainedMarks: 94, grade: 'O', status: 'Pass' },
    { subject: 'Social Studies', maxMarks: 100, obtainedMarks: 87, grade: 'A+', status: 'Pass' },
  ];

  const totalMax = subjects.reduce((sum, s) => sum + Number(s.maxMarks), 0);
  const totalObtained = subjects.reduce((sum, s) => sum + Number(s.obtainedMarks), 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  const getOverallGrade = (pct) => {
    if (pct >= 90) return 'O (Outstanding)';
    if (pct >= 80) return 'A+ (Excellent)';
    if (pct >= 70) return 'A (Very Good)';
    if (pct >= 60) return 'B (Good)';
    return 'C (Satisfactory)';
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const windowUrl = 'about:blank';
    const windowName = 'Report_Card_Print';
    const printWindow = window.open(windowUrl, windowName, 'width=800,height=900');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Report Card - ${studentName} (${examName})</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: sans-serif; padding: 20px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    handlePrint();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Actions */}
        <div className="bg-[#0C4A86] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-base">Official Progress Report Card — {examName}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 bg-[#0096DA] hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Content */}
        <div ref={printRef} className="p-8 bg-white text-slate-800 space-y-6">
          {/* School Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <h1 className="text-2xl font-black text-[#0C4A86] uppercase tracking-wide">ABS INTERNATIONAL SCHOOL</h1>
            <p className="text-xs text-slate-600 font-bold mt-1">Affiliated to CBSE Board • Academic Year {academicYear}</p>
            <span className="inline-block mt-3 bg-[#EBF5FF] text-[#0C4A86] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider border border-[#BFDBFE]">
              OFFICIAL REPORT CARD — {examName.toUpperCase()}
            </span>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Student Name</span>
              <span className="font-extrabold text-slate-900 text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Roll Number</span>
              <span className="font-extrabold text-slate-900 text-sm">{rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Grade & Section</span>
              <span className="font-extrabold text-slate-900 text-sm">{grade} - {section}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Attendance %</span>
              <span className="font-extrabold text-emerald-700 text-sm">{attendancePct}% Present</span>
            </div>
          </div>

          {/* Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-[#0C4A86] text-white uppercase text-[10px]">
                  <th className="p-3 border border-slate-700 font-bold">Subject</th>
                  <th className="p-3 border border-slate-700 text-center font-bold">Max Marks</th>
                  <th className="p-3 border border-slate-700 text-center font-bold">Obtained Marks</th>
                  <th className="p-3 border border-slate-700 text-center font-bold">Percentage</th>
                  <th className="p-3 border border-slate-700 text-center font-bold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {subjects.map((sub, i) => {
                  const pct = Math.round((sub.obtainedMarks / sub.maxMarks) * 100);
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3 border border-slate-300 font-bold text-slate-900">{sub.subject}</td>
                      <td className="p-3 border border-slate-300 text-center font-semibold">{sub.maxMarks}</td>
                      <td className="p-3 border border-slate-300 text-center font-black text-[#0C4A86]">{sub.obtainedMarks}</td>
                      <td className="p-3 border border-slate-300 text-center font-bold">{pct}%</td>
                      <td className="p-3 border border-slate-300 text-center">
                        <span className="bg-[#EBF5FF] text-[#0C4A86] font-black px-2.5 py-0.5 rounded text-[11px] border border-[#BFDBFE]">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-100 font-extrabold text-slate-900">
                  <td className="p-3 border border-slate-300">TOTAL / OVERALL SUMMARY</td>
                  <td className="p-3 border border-slate-300 text-center">{totalMax}</td>
                  <td className="p-3 border border-slate-300 text-center text-[#0C4A86] text-sm">{totalObtained}</td>
                  <td className="p-3 border border-slate-300 text-center text-[#0C4A86] text-sm">{overallPercentage}%</td>
                  <td className="p-3 border border-slate-300 text-center">{getOverallGrade(overallPercentage)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#0C4A86]" /> Class Teacher Remarks
              </h4>
              <p className="text-slate-700 italic">
                "{studentName} demonstrates great interest in academics and active participation. Excellent performance overall."
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" /> Principal Remarks
              </h4>
              <p className="text-slate-700 italic">
                "Passed {examName} with high distinction. Keep maintaining this exemplary standard."
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 border-t border-slate-200 flex justify-between items-end text-xs font-bold text-slate-700">
            <div className="text-center">
              <div className="w-36 border-b-2 border-slate-400 mb-1"></div>
              <span>Class Teacher Signature</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b-2 border-slate-400 mb-1"></div>
              <span>Parent Signature</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b-2 border-slate-900 mb-1"></div>
              <span className="text-slate-900 font-black">Principal Seal & Signature</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportCardModal;
