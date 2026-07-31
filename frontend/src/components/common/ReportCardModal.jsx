import React, { useRef } from 'react';
import { X, Printer, Download, Award, BookOpen, CheckCircle, UserCheck } from 'lucide-react';

const ReportCardModal = ({ isOpen, onClose, studentData, marksData = [], attendancePct = 95 }) => {
  const printRef = useRef(null);

  if (!isOpen || !studentData) return null;

  const studentName = studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Ramesh Sharma';
  const rollNumber = studentData.rollNumber || studentData.rollNo || '101';
  const grade = studentData.grade || studentData.className || 'Grade 1';
  const section = studentData.section || 'A';
  const academicYear = '2026-2027';

  // Format subject-wise marks
  const defaultSubjects = [
    { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 92, grade: 'A+' },
    { subject: 'Science', maxMarks: 100, obtainedMarks: 88, grade: 'A' },
    { subject: 'English', maxMarks: 100, obtainedMarks: 85, grade: 'A' },
    { subject: 'Social Studies', maxMarks: 100, obtainedMarks: 90, grade: 'A+' },
    { subject: 'Computer Science', maxMarks: 100, obtainedMarks: 95, grade: 'O' },
  ];

  const subjects = marksData.length > 0 ? marksData.map(m => ({
    subject: m.subjectName || m.subject?.name || 'Subject',
    maxMarks: m.totalMarks || m.maxMarks || 100,
    obtainedMarks: m.obtainedMarks || m.marks || 0,
    grade: m.grade || (m.obtainedMarks >= 90 ? 'A+' : m.obtainedMarks >= 80 ? 'A' : 'B'),
  })) : defaultSubjects;

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
          <title>Student Report Card - ${studentName}</title>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Actions */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-lg">Official Student Progress Report Card</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Content */}
        <div ref={printRef} className="p-8 bg-white text-slate-800">
          {/* School Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">GREENWOOD HIGH SCHOOL</h1>
            <p className="text-xs text-slate-600 font-medium mt-1">Affiliated to CBSE • School Code: GHS101 • Academic Year {academicYear}</p>
            <span className="inline-block mt-3 bg-slate-100 text-slate-800 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider border border-slate-300">
              ACADEMIC PERFORMANCE REPORT CARD
            </span>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Roll Number</span>
              <span className="font-bold text-slate-900 text-sm">{rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Grade & Section</span>
              <span className="font-bold text-slate-900 text-sm">{grade} - {section}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Attendance %</span>
              <span className="font-bold text-emerald-700 text-sm">{attendancePct}% Present</span>
            </div>
          </div>

          {/* Marks Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px]">
                  <th className="p-3 border border-slate-700">Subject</th>
                  <th className="p-3 border border-slate-700 text-center">Max Marks</th>
                  <th className="p-3 border border-slate-700 text-center">Obtained Marks</th>
                  <th className="p-3 border border-slate-700 text-center">Percentage</th>
                  <th className="p-3 border border-slate-700 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {subjects.map((sub, i) => {
                  const pct = Math.round((sub.obtainedMarks / sub.maxMarks) * 100);
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3 border border-slate-300 font-bold text-slate-900">{sub.subject}</td>
                      <td className="p-3 border border-slate-300 text-center">{sub.maxMarks}</td>
                      <td className="p-3 border border-slate-300 text-center font-bold text-slate-900">{sub.obtainedMarks}</td>
                      <td className="p-3 border border-slate-300 text-center">{pct}%</td>
                      <td className="p-3 border border-slate-300 text-center">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[11px]">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="p-3 border border-slate-300">TOTAL / SUMMARY</td>
                  <td className="p-3 border border-slate-300 text-center">{totalMax}</td>
                  <td className="p-3 border border-slate-300 text-center text-indigo-700 text-sm">{totalObtained}</td>
                  <td className="p-3 border border-slate-300 text-center text-indigo-700 text-sm">{overallPercentage}%</td>
                  <td className="p-3 border border-slate-300 text-center">{getOverallGrade(overallPercentage)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Class Teacher Remarks
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
                "Promoted to next academic term. Keep maintaining this exemplary standard of learning."
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-12 border-t border-slate-200 flex justify-between items-end text-xs font-bold text-slate-700">
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
              <span className="text-slate-900 font-extrabold">Principal Seal & Signature</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportCardModal;
