const normalizeRole = (role) => (typeof role === 'string' ? role.toLowerCase() : '');

const roleMiddleware = (allowedRoles) => {
  const normalizedAllowedRoles = (allowedRoles || []).map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = roleMiddleware;
