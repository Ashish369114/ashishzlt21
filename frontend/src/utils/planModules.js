const silverModules = [
  'Multiple Dashboards',
  'News Management',
  'Timetable Management',
  'Student Admission',
  'Messaging System',
  'Student Attendance',
  'Courses and Batches',
  'Human Resources (HR)',
  'Finance Management',
  'Examination Management',
  'User Management',
  'Report Center',
  'Employee / Teacher Login',
  'Student / Parent Login',
  'Student Information Management',
  'Custom Student Remarks',
  'Certificate Generator',
  'ID Card Generator',
  'SMS Integration',
  'School & Events Calendar',
  'Advance Fee Management',
  'Gradebook',
];

const goldModules = [
  ...silverModules,
  'Advanced Analytics',
  'Homework Management',
  'Payroll Automation',
];

const platinumModules = [
  ...goldModules,
  'Multi-Branch Management',
  'Dedicated Support',
];

export const getPlanModules = (planName = 'silver') => {
  const normalizedPlan = String(planName || '').toLowerCase();
  if (normalizedPlan === 'gold') return goldModules;
  if (normalizedPlan.startsWith('platinum')) {
    if (normalizedPlan.includes('ocr')) {
      return [...platinumModules, 'OCR Document Scanner'];
    }
    return platinumModules;
  }
  return silverModules;
};

export const getPlanDisplayName = (planName = 'silver') => {
  const normalizedPlan = String(planName || '').toLowerCase();
  if (normalizedPlan === 'gold') return 'Gold Plan';
  if (normalizedPlan === 'platinum_with_ocr') return 'Platinum Plan (With OCR)';
  if (normalizedPlan === 'platinum_without_ocr' || normalizedPlan === 'platinum') return 'Platinum Plan (Without OCR)';
  return 'Silver Plan';
};
