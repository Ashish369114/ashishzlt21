const User = require('../models/User');

const adminRoleFixes = [
  { userId: 'SUPERADMIN001', expectedRole: 'super_admin' },
  { userId: 'PRINCIPAL001', expectedRole: 'principal' },
  { userId: 'ACCOUNTANT001', expectedRole: 'accountant_admin' },
];

const ensureAdminRoles = async () => {
  for (const fix of adminRoleFixes) {
    const user = await User.findOne({ userId: fix.userId });
    if (!user) {
      console.log(`RoleFixer: no user found for ${fix.userId}`);
      continue;
    }

    if (user.role !== fix.expectedRole) {
      console.log(`RoleFixer: updating ${fix.userId} role ${user.role} -> ${fix.expectedRole}`);
      user.role = fix.expectedRole;
      await user.save();
    }
  }
};

module.exports = { ensureAdminRoles };
