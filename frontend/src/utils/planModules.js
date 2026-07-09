const silverModules = [
  'Core Academics Module',
  'Timetable Management',
  'Student Attendance',
  'Homework Management',
  'School & Events Calendar',
  'Student Admission',
  'User Management',
  'Student / Parent Login',
  'Student Information Management',
  'News Management',
  'Report Center'
];

const goldModules = [
  ...silverModules,
  'Gradebook',
  'Examination Management',
  'Human Resources (HR)',
  'Finance Management',
  'Advance Fee Management',
  'Employee / Teacher Login',
  'Messaging System',
  'Custom Student Remarks',
  'Certificate Generator',
  'ID Card Generator'
];

const platinumModules = [
  ...goldModules,
  'Multi-Branch Management',
  'Payroll Automation',
  'SMS Integration',
  'Dedicated Support',
  'Advanced Analytics'
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
