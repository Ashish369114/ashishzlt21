import { getPlanModules, getPlanDisplayName } from './planModules';

describe('plan module helpers', () => {
  it('returns the silver module list for silver subscriptions', () => {
    const modules = getPlanModules('silver');
    expect(modules).toEqual(expect.arrayContaining(['News Management', 'Timetable Management', 'Student Attendance', 'Gradebook']));
  });

  it('returns the gold module list for gold subscriptions', () => {
    const modules = getPlanModules('gold');
    expect(modules).toEqual(expect.arrayContaining(['Certificate Generator', 'ID Card Generator', 'SMS Integration']));
  });

  it('formats plan labels consistently', () => {
    expect(getPlanDisplayName('silver')).toBe('Silver Plan');
    expect(getPlanDisplayName('platinum')).toBe('Platinum Plan');
  });
});
